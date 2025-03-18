import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../database/entities/post.entity';

@Injectable()
export class PostService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  findAll(): Promise<Post[]> {
    return this.dataSource.getRepository(Post).find({
      relations: ['author'],
    });
  }

  async createPost(post: Post): Promise<Post> {
    const postRepo = this.dataSource.getRepository(Post);
    const newPost = postRepo.create(post);
    return await postRepo.save(newPost);
  }

  async findOne(id: number) {
    const result = await this.dataSource.getRepository(Post).findOneBy({ id });
    if (result) {
      return result;
    } else {
      throw new NotFoundException({
        message: `Пост с id:${id} не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
  }

  async deletePost(id: number): Promise<void> {
    const result = await this.dataSource.getRepository(Post).delete(id);
    if (result.affected === 0) {
      throw new NotFoundException({
        message: `Пост с id:${id} не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
  }

  async updatePost(id: number, updateData: Partial<Post>): Promise<Post> {
    const post = await this.dataSource
      .getRepository(Post)
      .findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException({
        message: `Пост с id:${id} не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
    if (updateData.id) {
      delete updateData.id;
    }
    const updatedUser = { ...post, ...updateData };

    return await this.dataSource.getRepository(Post).save(updatedUser);
  }
}
