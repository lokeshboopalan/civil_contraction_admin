import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // For development - allows all access
    // In production, implement proper authentication
    return true;
  }
}
