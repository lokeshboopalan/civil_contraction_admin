import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role, User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    console.log('UsersService initialized with repository');
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if we have any users
      const count = await this.userRepository.count();
      console.log(`Found ${count} users in database`);

      if (count === 0) {
        // Create a default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = this.userRepository.create({
          name: 'Admin User', // only if exists in entity
          email: 'admin@example.com',
          password: hashedPassword,
          role: Role.ADMIN,
        });

        await this.userRepository.save(adminUser);
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Error initializing data:', error.message);
    }
  }

  // CREATE
  async create(dto: CreateUserDto) {
    console.log('UsersService.create called with:', dto);

    try {
      // Check if email exists
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user entity
      const user = this.userRepository.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      });

      // Save to database
      const savedUser = await this.userRepository.save(user);
      console.log('User created with ID:', savedUser.id);

      // Return user without password
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<any> {
    const user = await this.findOne(id);
    user.avatar = avatarUrl;
    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;
    return result;
  }
  // GET ALL
  async findAll() {
    console.log('UsersService.findAll called');

    try {
      const users = await this.userRepository.find();
      console.log(`Found ${users.length} users`);

      // Return users without passwords
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  }

  // GET BY ID
  async findOne(id: number) {
    console.log('UsersService.findOne called for id:', id);

    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  // UPDATE
  async update(id: number, dto: UpdateUserDto) {
    console.log('UsersService.update called for id:', id, dto);

    try {
      // Find the user
      const user = await this.findOne(id);

      // Check email uniqueness if changing
      if (dto.email && dto.email !== user.email) {
        const exists = await this.userRepository.findOne({
          where: { email: dto.email },
        });

        if (exists) {
          throw new ConflictException('Email already exists');
        }
      }

      // Hash password if changing
      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
      }

      // Update user
      Object.assign(user, dto);
      const updatedUser = await this.userRepository.save(user);
      console.log('User updated:', id);

      // Return user without password
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // DELETE
  async remove(id: number) {
    console.log('UsersService.remove called for id:', id);

    try {
      const user = await this.findOne(id);
      await this.userRepository.remove(user);
      console.log('User deleted:', id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error in remove:', error);
      throw error;
    }
  }

  // FIND BY EMAIL (for Auth)
  async findByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch (error) {
      console.error('Error in findByEmail:', error);
      return null;
    }
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  // UPDATE PASSWORD (for Auth)
  async updatePassword(id: number, password: string) {
    try {
      const user = await this.findOne(id);
      user.password = await bcrypt.hash(password, 10);
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }
}
