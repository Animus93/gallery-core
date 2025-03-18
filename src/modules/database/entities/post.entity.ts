import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts) // Много записей Post к одному User
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({
    nullable: true,
  })
  isActive: boolean;
}
