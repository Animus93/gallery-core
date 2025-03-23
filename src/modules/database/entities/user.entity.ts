import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Post } from './post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({
    select: false,
    unique: true,
  })
  login: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  imgPath: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @Exclude()
  @Column({
    select: false,
  })
  password: string;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  roles: string[];

  @Column({
    nullable: true,
    default: true,
  })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastOnlineAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  @Expose()
  posts: Post[];
}
