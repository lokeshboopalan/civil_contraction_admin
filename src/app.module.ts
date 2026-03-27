import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
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
      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const isProduction = process.env.NODE_ENV === 'production';
        const databaseUrl = process.env.DATABASE_URL;

        console.log('================== DATABASE CONFIG ==================');
        console.log(
          'Environment:',
          isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
        );
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!databaseUrl);

        // PRODUCTION (Railway) - Use DATABASE_URL with SSL
        if (isProduction && databaseUrl) {
          // Ensure proper SSL mode for Railway
          let finalUrl = databaseUrl;
          if (!finalUrl.includes('sslmode=')) {
            finalUrl = finalUrl.includes('?')
              ? `${finalUrl}&sslmode=no-verify`
              : `${finalUrl}?sslmode=no-verify`;
          } else if (finalUrl.includes('sslmode=require')) {
            finalUrl = finalUrl.replace('sslmode=require', 'sslmode=no-verify');
          }

          const sanitizedUrl = finalUrl.replace(/:[^:@]+@/, ':***@');
          console.log('✅ Production DB URL:', sanitizedUrl);

          return {
            type: 'postgres',
            url: finalUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
            logging: true,
            retryAttempts: 10,
            retryDelay: 3000,
          } as TypeOrmModuleOptions;
        }

        // DEVELOPMENT (Local) - Use local PostgreSQL
        console.log('✅ Using local PostgreSQL (no SSL)');

        // Get local database configuration
        const host =
          process.env.DB_HOST || config.get('database.host') || 'localhost';
        const port = parseInt(
          process.env.DB_PORT || config.get('database.port') || '5432',
        );
        const username =
          process.env.DB_USERNAME ||
          config.get('database.username') ||
          'postgres';
        const password =
          process.env.DB_PASSWORD || config.get('database.password') || '';
        const database =
          process.env.DB_DATABASE ||
          config.get('database.name') ||
          'ticket_management';

        console.log(`Local DB: ${host}:${port}/${database}`);

        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          autoLoadEntities: true,
          synchronize: true,
          ssl: false,
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
        } as TypeOrmModuleOptions;
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
