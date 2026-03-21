import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum ProjectStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column({ default: () => 'CURRENT_DATE' })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ONGOING,
  })
  status: ProjectStatus;

  @Column('json', { nullable: true, default: [] })
  images: Array<{
    url: string;
    publicId: string;
    fileName: string;
  }>;
}
