import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { UserModule } from '../../user/user.module';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { User } from '../../user/entities/user.entity';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'SECRET_KEY',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    ProfileService,
    JwtStrategy,
    LocalStrategy,
    SessionAuthGuard,
    CloudinaryService,
  ],
  exports: [AuthService, JwtModule, SessionAuthGuard],
})
export class AuthModule {}
