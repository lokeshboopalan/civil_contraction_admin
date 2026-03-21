import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { FeatureProjectStatus } from '../entities/feature-project.entity';

export class UpdateFeatureProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(FeatureProjectStatus)
  status?: FeatureProjectStatus;

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
