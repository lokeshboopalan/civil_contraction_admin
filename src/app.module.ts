import {
  Module,
  MiddlewareConsumer,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/admin/auth/auth.module';
import { ProjectsModule } from './modules/admin/project/project.module';
import { UserMiddleware } from './modules/admin/middleware/user.middleware';
import { FrontendModule } from './modules/frontend/controllers/frontend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.development', '.env.production'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        // Try multiple possible database URL sources
        const databaseUrl =
          process.env.DATABASE_URL ||
          process.env.RAILWAY_DATABASE_URL ||
          process.env.POSTGRES_URL;

        const isProduction = process.env.NODE_ENV === 'production';

        console.log('\n=================================');
        console.log('🔧 DATABASE CONFIGURATION');
        console.log('=================================');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('Is Production:', isProduction);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log(
          'RAILWAY_DATABASE_URL exists:',
          !!process.env.RAILWAY_DATABASE_URL,
        );
        console.log('Final databaseUrl exists:', !!databaseUrl);

        if (databaseUrl) {
          console.log('✅ Using DATABASE_URL for connection');
          const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@');
          console.log('URL:', maskedUrl);
          console.log('=================================\n');

          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true, // Create tables
            ssl: {
              rejectUnauthorized: false,
            },
            logging: true,
            retryAttempts: 5,
            retryDelay: 3000,
          };
        }

        // If we're in production but no database URL, throw a clear error
        if (isProduction) {
          console.error('❌ ERROR: No DATABASE_URL found in production!');
          console.error(
            'Available environment variables:',
            Object.keys(process.env),
          );
          console.error('=================================\n');
          throw new Error(
            'DATABASE_URL is required in production. Please link your PostgreSQL service.',
          );
        }

        // Development fallback
        console.log('⚠️ No DATABASE_URL found, using local PostgreSQL');
        console.log('=================================\n');

        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'constraction_management',
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        };
      },
    }),
    AuthModule,
    FrontendModule,
    AdminModule,
    UserModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    try {
      const isProduction = process.env.NODE_ENV === 'production';

      // Test connection and get database info
      const result = await this.connection.query(
        'SELECT NOW() as current_time, version() as version, current_database() as database_name',
      );

      this.logger.log('\n=================================');
      this.logger.log('✅ DATABASE CONNECTION SUCCESSFUL');
      this.logger.log('=================================');
      this.logger.log(
        `🌍 Environment: ${isProduction ? 'Production (Railway)' : 'Development (Local)'}`,
      );
      this.logger.log(`📊 Database name: ${result[0].database_name}`);
      this.logger.log(`📅 Server time: ${result[0].current_time}`);
      this.logger.log(`🐘 PostgreSQL version: ${result[0].version}`);

      // Check existing tables in development
      if (!isProduction) {
        const tables = await this.connection.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);

        if (tables.length > 0) {
          this.logger.log(
            `📋 Found ${tables.length} tables: ${tables.map((t) => t.table_name).join(', ')}`,
          );
        } else {
          this.logger.warn(
            '⚠️ No tables found. Tables will be auto-created (synchronize: true)',
          );
        }
      }

      this.logger.log('=================================\n');
    } catch (error) {
      this.logger.error('\n=================================');
      this.logger.error('❌ DATABASE CONNECTION FAILED');
      this.logger.error('=================================');
      this.logger.error(`Error: ${error.message}`);

      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        this.logger.error('\n💡 Troubleshooting tips:');
        this.logger.error(
          '1. Make sure PostgreSQL is running: sudo service postgresql start',
        );
        this.logger.error(
          '2. Check your .env file has correct database credentials',
        );
        this.logger.error('3. Verify database exists: psql -U postgres -l');
        this.logger.error(
          '4. Test connection: psql -U postgres -d constraction_management',
        );
      } else {
        this.logger.error('\n💡 Troubleshooting tips:');
        this.logger.error('1. Check DATABASE_URL in Railway variables');
        this.logger.error('2. Verify Postgres service is online in Railway');
        this.logger.error('3. Check if DATABASE_URL is properly referenced');
      }
      this.logger.error('=================================\n');

      // Don't throw - let the app try to continue
      // The app will still start but database features won't work
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
