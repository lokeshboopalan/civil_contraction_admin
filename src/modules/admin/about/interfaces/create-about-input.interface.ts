import { AboutImage } from './about-image.interface';
import { SocialLink } from './about-social-link.interface';

export interface TeamMemberInput {
  name: string;
  position: string;
  image?: AboutImage;
  bio?: string | null;
  socialLinks?: SocialLink[];
  sortOrder: number; // Make required, not optional
}

export interface MilestoneInput {
  year: string;
  title: string;
  description: string;
  icon?: string | null;
  sortOrder: number; // Make required, not optional
}

export interface CreateAboutInput {
  title: string;
  subtitle?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  missionStatement?: string | null;
  visionStatement?: string | null;
  coreValues?: string | null;
  icon?: string | null;
  videoUrl?: string | null;
  brochureUrl?: string | null;
  isActive?: boolean;
  images: AboutImage[];
  socialLinks?: SocialLink[];
  teamMembers?: TeamMemberInput[];
  milestones?: MilestoneInput[];
}
