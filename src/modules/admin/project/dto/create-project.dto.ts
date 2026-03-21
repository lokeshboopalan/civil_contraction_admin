import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsString,
} from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  location: string;

  @IsNotEmpty({ message: 'Start date is required' })
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsEnum(ProjectStatus, { message: 'Invalid status' })
  status: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
