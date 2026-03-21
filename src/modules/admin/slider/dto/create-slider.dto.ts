import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SliderImageDto {
  @IsString()
  url: string;

  @IsString()
  publicId: string;

  @IsString()
  fileName: string;
}

export class CreateSliderDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

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
  @ValidateNested({ each: true })
  @Type(() => SliderImageDto)
  images?: SliderImageDto[];
}
