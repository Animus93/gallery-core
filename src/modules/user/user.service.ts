import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { isFileExtensionSafe, removeFile } from '../../helpers/image-storage';
import * as path from 'node:path';
import * as process from 'node:process';

@Injectable()
export class UserService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  findAll(scope: string = ''): Promise<User[]> {
    const scopeArray = scope.split(',');
    return this.dataSource.getRepository(User).find({
      relations: scopeArray.indexOf('posts') === -1 ? null : ['posts'],
    });
  }

  async findOne(data: { login?: string; id?: number }, scope: string = '') {
    const scopeArray = scope.split(',');
    const getLogin = scopeArray.indexOf('login') !== -1;
    const getPassword = scopeArray.indexOf('password') !== -1;
    const getPosts = scopeArray.indexOf('posts') !== -1;
    const { login, id } = data;
    const whereCondition: { login?: string; id?: number } = {};
    if (login) {
      whereCondition.login = login;
    } else if (id) {
      whereCondition.id = id;
    } else {
      throw new NotFoundException({
        message: `необходимо указать login или id в запросе`,
        code: HttpStatus.BAD_REQUEST,
      });
    }
    const queryBuilder = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where(whereCondition);

    // Добавляем выборку пароля, если нужно
    if (getPassword) {
      queryBuilder.addSelect('user.password');
    }

    // Добавляем выборку логина, если нужно
    if (getLogin) {
      queryBuilder.addSelect('user.login');
    }

    // Добавляем JOIN для постов, если нужно
    if (getPosts) {
      queryBuilder.leftJoinAndSelect('user.posts', 'post');
    }

    const result = await queryBuilder.getOne();

    if (result) {
      return result;
    } else {
      throw new NotFoundException({
        message: `Пользователь не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.dataSource.getRepository(User).delete(id);
    if (result.affected === 0) {
      throw new NotFoundException({
        message: `Пользователь не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
  }

  async updateUser(
    id: number,
    updateData: Partial<User>,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const fileName = file.filename;
      if (!fileName) {
        throw new BadRequestException({
          message:
            'Неподдерживаемый формат файла. Разрешены только JPEG, PNG и JPG.',
        });
      }
      const imagesFolderPath = path.join(process.cwd(), 'uploads/avatars');
      const fullImagePath = path.join(imagesFolderPath + '/' + file.filename);
      const isFileSafe = await isFileExtensionSafe(fullImagePath);
      if (isFileSafe) {
        // updateData.imgPath = file.filename;
        updateData.imgPath = file.filename;
      } else {
        removeFile(fullImagePath);
        throw new BadRequestException({
          message: 'Неверный формат файла используйте PNG JPG JPEG',
        });
      }
    }
    delete updateData.id;
    const result = await this.dataSource
      .createQueryBuilder()
      .update(User, updateData)
      .where({ id })
      .updateEntity(true)
      .returning([
        'id',
        'firstName',
        'lastName',
        'roles',
        'isActive',
        'imgPath',
        'posts',
      ])
      .execute();
    const raw = result.raw as Array<any>;
    if (!raw.length) {
      throw new NotFoundException({
        message: `Пользователь не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
    return raw[0];
  }
}
