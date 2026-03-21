import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ArticleRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  CONTRIBUTOR = 'contributor',
}

export interface ArticleImage {
  url: string;
  publicId: string;
  fileName: string;
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subTitle: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true, default: [] })
  images: ArticleImage[];

  @Column({
    type: 'enum',
    enum: ArticleRole,
    default: ArticleRole.CONTRIBUTOR,
  })
  role: ArticleRole;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  views: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
