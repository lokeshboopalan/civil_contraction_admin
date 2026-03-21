import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../../user/services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(private usersService: UsersService) {
    console.log('ProfileService initialized');
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    // Use the usersService.update method which already handles all the logic
    const updatedUser = await this.usersService.update(
      userId,
      updateProfileDto,
    );
    return updatedUser; // usersService.update already removes password
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password and confirm password match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    // Use usersService.updatePassword method
    await this.usersService.updatePassword(
      userId,
      changePasswordDto.newPassword,
    );

    return { message: 'Password changed successfully' };
  }

  async uploadAvatar(userId: number, avatarUrl: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the avatar field
    const updatedUser = await this.usersService.update(userId, {
      avatar: avatarUrl,
    });
    return updatedUser;
  }
}
