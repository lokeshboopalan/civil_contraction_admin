import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { ServiceStatus } from '../entities/service.entity';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];
}
