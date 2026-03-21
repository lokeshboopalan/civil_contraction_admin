import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLinkDto, TeamMemberDto, MilestoneDto } from './create-about.dto';

export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  title?: string;

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
