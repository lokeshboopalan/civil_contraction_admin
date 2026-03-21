import {
  Controller,
  Get,
  Render,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../../user/services/users.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
// import { AdminAuthGuard } from '../guards/admin-auth.guard';
// import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WebAuthGuard } from '../auth/guards/web-auth.guard';

@Controller('admin')
// @UseGuards(AdminAuthGuard)
@UseGuards(WebAuthGuard)
export class AdminUserController {
  constructor(private readonly usersService: UsersService) {
    console.log('AdminUserController initialized');
  }

  // TEST ROUTE - Add this temporarily
  @Get('test')
  testRoute() {
    return { message: 'AdminUserController test route is working!' };
  }

  @Get('users')
  @Render('admin/users')
  async getUsers() {
    console.log('AdminUserController.getUsers() called');
    const users = await this.usersService.findAll();
    return {
      title: 'Users',
      currentPage: 'users',
      user: { name: 'Admin User', role: 'Admin' },
      users: users,
    };
  }

  @Get('users/create')
  @Render('admin/user-form')
  createUserForm() {
    console.log('AdminUserController.createUserForm() called');
    return {
      title: 'Create User',
      currentPage: 'users',
      user: { name: 'Admin User', role: 'Admin' },
      isEdit: false,
      userData: {},
    };
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      console.log('Creating user with data:', createUserDto);
      const result = await this.usersService.create(createUserDto);
      console.log('User created:', result);

      // Redirect with success message
      return res.redirect('/admin/users?success=User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);

      // Render the form again with error
      return res.status(HttpStatus.BAD_REQUEST).render('admin/user-form', {
        title: 'Create User',
        currentPage: 'users',
        user: { name: 'Admin User', role: 'admin' },
        isEdit: false,
        error: error.message,
        userData: createUserDto,
      });
    }
  }

  @Get('users/edit/:id')
  @Render('admin/user-form')
  async editUserForm(@Param('id') id: string) {
    console.log('AdminUserController.editUserForm() called for id:', id);
    const user = await this.usersService.findOne(Number(id));
    const { password, ...userData } = user;
    return {
      title: 'Edit User',
      currentPage: 'users',
      user: { name: 'Admin User', role: 'Admin' },
      isEdit: true,
      userData: userData,
    };
  }

  @Post('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    console.log(
      'AdminUserController.updateUser() called for id:',
      id,
      updateUserDto,
    );
    try {
      await this.usersService.update(Number(id), updateUserDto);
      return res.redirect('/admin/users');
    } catch (error) {
      const user = await this.usersService.findOne(Number(id));
      const { password, ...userData } = user;
      return res.status(HttpStatus.BAD_REQUEST).render('admin/user-form', {
        title: 'Edit User',
        currentPage: 'users',
        user: { name: 'Admin User', role: 'Admin' },
        isEdit: true,
        error: error.message,
        userData: { ...userData, ...updateUserDto },
      });
    }
  }

  @Get('users/delete/:id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    console.log('AdminUserController.deleteUser() called for id:', id);
    try {
      await this.usersService.remove(Number(id));
      return res.redirect('/admin/users');
    } catch (error) {
      return res.redirect(
        '/admin/users?error=' + encodeURIComponent(error.message),
      );
    }
  }

  @Get('users/view/:id')
  @Render('admin/user-view')
  async viewUser(@Param('id') id: string) {
    console.log('AdminUserControlleasdr.viewUser() called for id:', id);
    const user = await this.usersService.findOne(Number(id));
    const { password, ...userData } = user;
    return {
      title: 'View User',
      currentPage: 'users',
      user: { name: 'Admin User', role: 'Admin' },
      userData: userData,
    };
  }
}
