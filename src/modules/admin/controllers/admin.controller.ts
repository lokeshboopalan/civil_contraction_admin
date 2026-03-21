// src/modules/admin/users/admin-users.controller.ts

import { Controller, Get } from '@nestjs/common';

@Controller('admin/api')
export class AdminUsersController {
  @Get('')
  getUsers() {
    return 'Admin Users List';
  }
}
