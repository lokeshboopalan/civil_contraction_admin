import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ArticleRole } from '../entities/article.entity';

export class CreateArticleDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subTitle?: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(ArticleRole, { message: 'Invalid role' })
  role?: ArticleRole;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[]; // Will store image URLs
}
