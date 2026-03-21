import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class WebAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const secret = this.configService.get('JWT_SECRET') || 'SECRET_KEY';
      const payload = jwt.verify(token, secret);

      // Attach user to request
      request.user = payload;
      console.log(request.user, 'kjadsfnkjsdfnjkksfg');
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
}
