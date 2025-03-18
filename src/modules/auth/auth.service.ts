import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/entities/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async signUp(user: User): Promise<any> {
    const userRepo = this.dataSource.getRepository(User);
    try {
      const result = await userRepo.save(user);
      return {
        access_token: await this.jwtService.signAsync({ ...user }),
        user: {
          firstName: result.firstName,
          lastName: result.lastName,
          roles: result.roles,
          isActive: result.isActive,
          lastOnlineAt: result.lastOnlineAt,
          id: result.id,
        },
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException({
          message: `Логин ${user.login} занят`,
        });
      }
      throw new UnauthorizedException();
    }
  }

  async signIn(login: string, pass: string | number): Promise<any> {
    pass = pass.toString();
    const result = await this.userService.findOne({ login }, 'password');
    if (result?.password !== pass) {
      throw new UnauthorizedException({
        message: 'Неверный логин или пароль',
      });
    }
    delete result.password;
    return {
      access_token: await this.jwtService.signAsync({ ...result }),
      user: {
        firstName: result.firstName,
        lastName: result.lastName,
        roles: result.roles,
        isActive: result.isActive,
        lastOnlineAt: result.lastOnlineAt,
        id: result.id,
      },
    };
  }
}
