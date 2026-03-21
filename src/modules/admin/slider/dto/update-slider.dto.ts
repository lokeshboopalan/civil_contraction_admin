import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateSliderDto {
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
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[];
}
