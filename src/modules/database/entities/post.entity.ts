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

  @Column({ nullable: true })
  imgPath: string;

  @Column({ nullable: true })
  text: string;

  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({
    nullable: true,
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
