import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.ADMIN,
  })
  role: Role;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;
}
