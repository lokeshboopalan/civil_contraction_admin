import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../../user/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Custom extractor for cookies
        (request: Request) => {
          console.log('JwtStrategy: Attempting to extract token');

          // Try to get from cookies
          if (request?.cookies) {
            const token = request.cookies['access_token'];
            if (token) {
              console.log('JwtStrategy: Token found in cookies');
              return token;
            }
          }

          // Try Authorization header as fallback
          const authHeader = request?.headers?.authorization;
          if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer' && token) {
              console.log('JwtStrategy: Token found in Authorization header');
              return token;
            }
          }

          console.log('JwtStrategy: No token found');
          return null;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET') || 'SECRET_KEY',
      ignoreExpiration: false,
    });
    console.log('JwtStrategy initialized');
  }

  async validate(payload: JwtPayload) {
    console.log('JwtStrategy validate called with payload:', payload);

    if (!payload || !payload.sub) {
      console.log('JwtStrategy: Invalid payload');
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      console.log('JwtStrategy: User not found for ID:', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    console.log('JwtStrategy: User validated successfully:', user.email);
    return {
      userId: payload.sub,
      email: payload.email,
      avatar: payload.avatar,
      name: payload.name,
    };
  }
}
