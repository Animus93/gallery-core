import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private extractTokenFromHeader(request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.url.includes('auth')) return true;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException({
        message: 'Необходимо пройти авторизацию',
      });
    }
    try {
      request.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });
    } catch {
      throw new UnauthorizedException({
        message: 'Необходимо пройти авторизацию',
      });
    }
    // await this.userService.updateUser(request.user.id, {
    //   lastOnlineAt: new Date(),
    // });
    return true;
  }
}
