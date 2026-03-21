import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../../user/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    console.log('AuthService initialized');
  }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('Validating user:', email);
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        console.log('User not found:', email);
        return null;
      }

      console.log('User found, comparing passwords');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);

      if (isMatch) {
        const { password, ...result } = user;
        console.log('User validated successfully');
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    console.log('AuthService.login called for email:', loginDto.email);

    try {
      const user = await this.usersService.findByEmail(loginDto.email);

      if (!user) {
        console.log('User not found in database');
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('User found, comparing password...');
      const isMatch = await bcrypt.compare(loginDto.password, user.password);

      if (!isMatch) {
        console.log('Password does not match');
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('Password matches, generating JWT...');
      const payload: JwtPayload = {
        name: user.name ?? undefined,
        sub: user.id,
        email: user.email,
        avatar: user.avatar ?? undefined,
      };

      const token = this.jwtService.sign(payload);
      console.log('JWT generated successfully');

      return {
        access_token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      console.error('Error in AuthService.login:', error);
      throw error;
    }
  }

  async getProfile(userId: number) {
    console.log('Getting profile for user ID:', userId);
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new Error('User not found'); // handle null
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    console.log('Changing password for user ID:', userId);
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new Error('User not found'); // handle null
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        throw new UnauthorizedException('Old password incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.usersService.updatePassword(userId, hashedPassword);

      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }
}
