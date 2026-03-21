import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface AboutImage {
  url: string;
  publicId: string;
  fileName: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
}

export interface TeamMember {
  name: string;
  position: string;
  image?: AboutImage;
  bio?: string | null;
  socialLinks?: SocialLink[];
  sortOrder: number;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
  icon?: string | null;
  sortOrder: number;
}

@Entity('about')
export class About {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subtitle: string | null;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  longDescription: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  missionStatement: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  visionStatement: string | null;

  @Column({ type: 'text', nullable: true })
  coreValues: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string | null;

  @Column({ type: 'json', nullable: true, default: [] })
  images: AboutImage[];

  @Column({ type: 'json', nullable: true, default: [] })
  socialLinks: SocialLink[];

  @Column({ type: 'json', nullable: true, default: [] })
  teamMembers: TeamMember[];

  @Column({ type: 'json', nullable: true, default: [] })
  milestones: Milestone[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brochureUrl: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
