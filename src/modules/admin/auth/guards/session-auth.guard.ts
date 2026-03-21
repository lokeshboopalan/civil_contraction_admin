import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'SECRET_KEY',
      });

      // Attach user to request
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
}
