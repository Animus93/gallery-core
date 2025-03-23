import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import * as path from 'node:path';
import * as process from 'node:process';
import { isFileExtensionSafe, removeFile } from '../../helpers/image-storage';

@Injectable()
export class PostService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private isValidSortField(entity: any, field: string): boolean {
    const metadata = this.dataSource.getMetadata(entity); // Получаем метаданные сущности
    const columnNames = metadata.columns.map((column) => column.propertyName); // Получаем все названия колонок
    return columnNames.includes(field); // Проверяем, существует ли поле
  }

  findAll(
    order: 'DESC' | 'ASC' = 'DESC',
    sort: string = 'createdAt',
  ): Promise<Post[]> {
    if (sort && !this.isValidSortField(Post, sort)) {
      throw new Error(`Неверное название поля для сортировки: ${sort}`);
    }
    return this.dataSource.getRepository(Post).find({
      order: sort ? { [sort]: order } : {},
    });
  }

  async createPost(post: Post, file?: Express.Multer.File): Promise<Post> {
    if (file) {
      await this.testFile(file);
      post.imgPath = file.filename;
    }
    delete post.author;
    delete post.id;
    return await this.dataSource.getRepository(Post).save(post);
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

  async updatePost(
    id: number,
    updateData: Partial<Post>,
    file?: Express.Multer.File,
  ): Promise<Post> {
    const post = await this.dataSource
      .getRepository(Post)
      .findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException({
        message: `Пост с id:${id} не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
    if (file) {
      await this.testFile(file);
      if (post.imgPath) {
        const imagesFolderPath = path.join(process.cwd(), 'uploads/posts');
        // удаляем старую картинку
        const fullImagePath = path.join(imagesFolderPath + '/' + post.imgPath);
        removeFile(fullImagePath);
      }
      // вставляем полученную картинку
      updateData.imgPath = file.filename;
    }
    delete updateData.id;
    delete updateData.author;
    const updatedUser = { ...post, ...updateData };

    return await this.dataSource.getRepository(Post).save(updatedUser);
  }

  private async testFile(file: Express.Multer.File) {
    const fileName = file.filename;
    if (!fileName) {
      throw new BadRequestException({
        message:
          'Неподдерживаемый формат файла. Разрешены только JPEG, PNG и JPG.',
      });
    }
    const imagesFolderPath = path.join(process.cwd(), 'uploads/posts');
    const fullImagePath = path.join(imagesFolderPath + '/' + file.filename);
    const isFileSafe = await isFileExtensionSafe(fullImagePath);
    if (isFileSafe) {
      // updateData.imgPath = file.filename;
    } else {
      removeFile(fullImagePath);
      throw new BadRequestException({
        message:
          'Неподдерживаемый формат файла. Разрешены только JPEG, PNG и JPG.',
      });
    }
  }
}
