import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../user/services/users.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request & { user: any }, res: Response, next: NextFunction) {
    try {
      // Get token from cookie
      const token = req.cookies?.access_token;

      if (token) {
        try {
          // Verify and decode token
          const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET || 'SECRET_KEY',
          );
          const userId = decoded.sub;

          if (userId) {
            // Fetch user from database
            const user = await this.usersService.findOne(userId);
            if (user) {
              // Remove password
              const { password, ...userData } = user;

              // Attach user to request
              req.user = userData;

              // Also attach to res.locals for template use
              res.locals.user = userData;
            }
          }
        } catch (jwtError) {
          console.error('JWT verification error:', jwtError.message);
        }
      }
    } catch (error) {
      console.error('User middleware error:', error.message);
    }

    next();
  }
}
