import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Render,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private cloudinaryService: CloudinaryService,
  ) {
    console.log('ProfileController initialized');
  }

  @Get('profile')
  @Render('admin/profile')
  async getProfile(@Req() req: any) {
    console.log('Profile page requested at /auth/profile');

    try {
      const userId = req.user?.userId;
      if (!userId) {
        console.error('No userId in request');
        return {
          title: 'My Profile',
          currentPage: 'profile',
          user: null,
          success: null,
          error: 'User not authenticated',
        };
      }

      const user = await this.profileService.getProfile(userId);

      // Update the user in request object so it's available in all views
      req.user = { ...req.user, ...user };

      return {
        title: 'My Profile',
        currentPage: 'profile',
        user: user, // Pass user to template
        success: null,
        error: null,
      };
    } catch (error) {
      console.error('Error loading profile:', error);
      return {
        title: 'My Profile',
        currentPage: 'profile',
        user: null,
        success: null,
        error: error.message,
      };
    }
  }

  @Post('profile/update')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.userId;
      const updatedUser = await this.profileService.updateProfile(
        userId,
        updateProfileDto,
      );

      // Update the user in the request object
      req.user = { ...req.user, ...updatedUser };

      // Also update session if you're using session-based auth
      if (req.session) {
        req.session.user = updatedUser;
      }

      return res.redirect('/auth/profile?success=Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.redirect(
        '/auth/profile?error=' + encodeURIComponent(error.message),
      );
    }
  }

  @Post('profile/change-password')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.userId;
      await this.profileService.changePassword(userId, changePasswordDto);
      return res.redirect(
        '/auth/profile?success=Password changed successfully',
      );
    } catch (error) {
      console.error('Error changing password:', error);
      return res.redirect(
        '/auth/profile?error=' + encodeURIComponent(error.message),
      );
    }
  }

  @Post('profile/upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.userId;

      if (!file) {
        return res.redirect('/auth/profile?error=No file uploaded');
      }

      const result = await this.cloudinaryService.uploadFile(file);
      const updatedUser = await this.profileService.uploadAvatar(
        userId,
        result.secure_url,
      );

      // Update the user in the request object
      req.user = { ...req.user, ...updatedUser };

      // Update session if using session auth
      if (req.session) {
        req.session.user = updatedUser;
      }

      return res.redirect('/auth/profile?success=Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return res.redirect(
        '/auth/profile?error=' + encodeURIComponent(error.message),
      );
    }
  }
}
