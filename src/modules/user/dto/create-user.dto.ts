import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(Role, { message: 'Role must be either admin or editor' })
  role: Role;
}
