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
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        // Debug logging
        console.log('=== Database Connection Debug ===');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

        if (process.env.DATABASE_URL) {
          console.log('DATABASE_URL found in environment');
        } else {
          console.log(
            'DATABASE_URL NOT found in environment, using hardcoded URL',
          );
        }
        console.log('================================');

        // HARDCODED RAILWAY URL - Use this for now
        const hardcodedUrl =
          'postgresql://postgres:UHhUupohIQHzQZiuZWUcBahTHmNVfujL@caboose.proxy.rlwy.net:12471/railway';

        // Try to get from environment, fallback to hardcoded
        const databaseUrl = process.env.DATABASE_URL || hardcodedUrl;

        console.log(
          '✅ Using database URL:',
          databaseUrl.replace(/:[^:@]+@/, ':****@'),
        );

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: true, // Set to true to create tables
          ssl: {
            rejectUnauthorized: false,
          },
          logging: true,
          retryAttempts: 10,
          retryDelay: 3000,
          connectTimeoutMS: 10000,
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
        'SELECT NOW() as current_time, current_database() as db_name, version() as version',
      );
      this.logger.log('✅ Database connected successfully!');
      this.logger.log(`📅 Database time: ${result[0].current_time}`);
      this.logger.log(`📊 Database name: ${result[0].db_name}`);
      this.logger.log(`🐘 PostgreSQL version: ${result[0].version}`);
    } catch (error) {
      this.logger.error(`❌ Database connection failed: ${error.message}`);
      this.logger.error('Please check your database configuration');
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
