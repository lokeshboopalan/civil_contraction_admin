import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/user.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // This registers the repository
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule], // Export both service and TypeOrmModule
})
export class UserModule {
  constructor() {
    console.log('UserModule initialized');
  }
}
