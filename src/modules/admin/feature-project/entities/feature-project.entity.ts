import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FeatureProjectStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  UPCOMING = 'upcoming',
}

export interface FeatureProjectImage {
  url: string;
  publicId: string;
  fileName: string;
}

@Entity('feature_projects')
export class FeatureProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({
    type: 'enum',
    enum: FeatureProjectStatus,
    default: FeatureProjectStatus.ONGOING,
  })
  status: FeatureProjectStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'json', nullable: true, default: [] })
  images: FeatureProjectImage[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
