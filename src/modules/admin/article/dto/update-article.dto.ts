import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ArticleRole } from '../entities/article.entity';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subTitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ArticleRole)
  role?: ArticleRole;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[];
}
