import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMING_SOON = 'coming_soon',
}

export interface ServiceImage {
  url: string;
  publicId: string;
  fileName: string;
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subtitle: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string | null;

  @Column({ type: 'json', nullable: true, default: [] })
  images: ServiceImage[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.ACTIVE,
  })
  status: ServiceStatus;

  @Column({ type: 'boolean', default: true })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'json', nullable: true, default: [] })
  features: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
