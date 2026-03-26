import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Req,
  Render,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  async loginPage(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.access_token;
    console.log('Login page accessed, token exists:', !!token);

    if (token) {
      try {
        console.log('User already has token, redirecting to dashboard');
        return res.redirect('/admin/dashboard');
      } catch {
        console.log('Token invalid, showing login page');
      }
    }

    const error = req.query.error as string;

    return res.render('auth/login', {
      title: 'Login',
      error: error || null,
    });
  }

@Post('login')
async login(@Body() loginDto: LoginDto, @Res() res: Response) {
  try {
    console.log('=================================');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('=================================');
    console.log('Email:', loginDto.email);
    console.log('Password provided:', !!loginDto.password);

    const result = await this.authService.login(loginDto);
    
    console.log('✅ Authentication successful');
    console.log('User ID:', result.user?.id);
    console.log('Token generated, length:', result.access_token?.length);

    // Detect if we're in production (HTTPS)
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('Cookie settings:', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      secure: isProduction,
      environment: isProduction ? 'production' : 'development'
    });

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      secure: isProduction,
    });

    console.log('✅ Cookie set in response');
    console.log('=================================\n');

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Login successful!',
      redirect: '/admin/dashboard',
      user: result.user,
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: error.message || 'Invalid email or password',
    });
  }
}

  // REMOVED: @Get('profile') endpoint - now handled by ProfileController

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    console.log('Logout endpoint accessed');
    res.clearCookie('access_token');
    return res.redirect('/auth/login');
  }
}
