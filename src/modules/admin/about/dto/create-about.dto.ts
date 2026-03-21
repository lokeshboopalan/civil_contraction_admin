import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsUrl,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinkDto {
  @IsString()
  platform: string;

  @IsUrl()
  url: string;

  @IsString()
  icon: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class TeamMemberDto {
  @IsString()
  name: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class MilestoneDto {
  @IsString()
  year: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateAboutDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  missionStatement?: string;

  @IsOptional()
  @IsString()
  visionStatement?: string;

  @IsOptional()
  @IsString()
  coreValues?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  brochureUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];
}
