import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface SliderImage {
  url: string;
  publicId: string;
  fileName: string;
}

@Entity('sliders')
export class Slider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  subTitle: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('json', { nullable: true, default: [] })
  images: SliderImage[];

  @Column({ default: 0 })
  order: number; // For sorting sliders

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
