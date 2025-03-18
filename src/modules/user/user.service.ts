import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';

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
    const result = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect(getPassword ? 'user.password' : null)
      .addSelect(getLogin ? 'user.login' : null)
      .where(whereCondition)
      .getOne();
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

  async updateUser(id: number, updateData: Partial<User>) {
    delete updateData.id;
    const result = await this.dataSource
      .createQueryBuilder()
      .update(User, updateData)
      .where({ id })
      .updateEntity(true)
      .returning(['id', 'firstName', 'lastName', 'roles', 'isActive'])
      .execute();
    const arr = result.raw as Array<any>;
    if (!arr.length) {
      throw new NotFoundException({
        message: `Пользователь не найден`,
        code: HttpStatus.NOT_FOUND,
      });
    }
    return arr[0];
  }
}
