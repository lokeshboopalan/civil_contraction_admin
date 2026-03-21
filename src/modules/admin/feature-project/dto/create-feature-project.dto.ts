import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { FeatureProjectStatus } from '../entities/feature-project.entity';

export class CreateFeatureProjectDto {
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

  @IsEnum(FeatureProjectStatus, { message: 'Invalid status' })
  status: FeatureProjectStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  images?: string[];
}
