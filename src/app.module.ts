import { Module, MiddlewareConsumer, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      // Explicitly set env file paths
      envFilePath: ['.env', '.env.production', '.env.local'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        // DEBUG: Log all database-related environment variables
        console.log('================== DATABASE CONFIG DEBUG ==================');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        
        if (process.env.DATABASE_URL) {
          const sanitizedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@');
          console.log('DATABASE_URL found:', sanitizedUrl);
        } else {
          console.error('⚠️ DATABASE_URL is NOT set in environment variables!');
          console.log('Available environment variables:', Object.keys(process.env).filter(key => 
            key.includes('DATABASE') || key.includes('DB_') || key.includes('POSTGRES')
          ));
        }
        
        // Check config service values
        console.log('ConfigService database.host:', config.get('database.host'));
        console.log('ConfigService database.port:', config.get('database.port'));
        console.log('ConfigService database.username:', config.get('database.username'));
        console.log('===================================================');
        
        // PRIORITIZE DATABASE_URL
        const databaseUrl = process.env.DATABASE_URL;
        
        if (databaseUrl) {
          console.log('✅ Using DATABASE_URL for PostgreSQL connection');
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
            logging: true,
            retryAttempts: 10,
            retryDelay: 3000,
          };
        }

        // Fallback to individual config
        console.log('⚠️ Using individual database config (fallback)');
        return {
          type: 'postgres',
          host: config.get('database.host') || 'localhost',
          port: config.get('database.port') || 5432,
          username: config.get('database.username') || 'postgres',
          password: config.get('database.password') || '',
          database: config.get('database.name') || 'railway',
          autoLoadEntities: true,
          synchronize: true,
          ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false,
          } : false,
          logging: true,
          retryAttempts: 10,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}