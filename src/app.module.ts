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
      // Explicitly tell ConfigModule to load from environment
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        // Debug logging
        console.log('=== Database Connection Debug ===');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

        // Safely log DATABASE_URL (hide password)
        if (process.env.DATABASE_URL) {
          const urlParts = process.env.DATABASE_URL.match(
            /postgresql:\/\/([^:]+):([^@]+)@(.+)/,
          );
          if (urlParts) {
            console.log(
              `DATABASE_URL: postgresql://${urlParts[1]}:****@${urlParts[3]}`,
            );
          }
        }

        console.log('================================');

        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          console.log('✅ Using Railway Postgres connection');

          // IMPORTANT: Set synchronize to true temporarily for first deployment
          // After tables are created, change back to false
          const isFirstDeployment = process.env.CREATE_TABLES === 'true';

          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: isFirstDeployment, // Set to true only when creating tables
            ssl: {
              rejectUnauthorized: false, // Required for Railway
            },
            logging: true, // Enable logging to see queries
            extra: {
              max: 20,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 10000,
            },
            // Add retry logic
            retryAttempts: 5,
            retryDelay: 3000,
          };
        }

        // Fallback to local development
        console.log('⚠️ Using local database configuration');
        return {
          type: 'postgres',
          host: config.get('database.host') || 'localhost',
          port: config.get('database.port') || 5432,
          username: config.get('database.username') || 'postgres',
          password: config.get('database.password') || 'postgres',
          database: config.get('database.name') || 'constraction_management',
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
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
      // Test the database connection
      const result = await this.connection.query(
        'SELECT NOW() as current_time, current_database() as db_name',
      );
      this.logger.log('✅ Database connected successfully!');
      this.logger.log(`📅 Database time: ${result[0].current_time}`);
      this.logger.log(`📊 Database name: ${result[0].db_name}`);

      // Check if tables exist
      const tables = await this.connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      this.logger.log(`📋 Found ${tables.length} tables in database`);
      if (tables.length === 0) {
        this.logger.warn(
          '⚠️ No tables found! Set CREATE_TABLES=true to create tables',
        );
      }
    } catch (error) {
      this.logger.error(`❌ Database connection failed: ${error.message}`);
      this.logger.error('Please check your DATABASE_URL environment variable');
      // Don't throw error to allow app to start
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
