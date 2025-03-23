import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../database/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImgToStorage } from '../../helpers/image-storage';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  getUsers(@Query('scope') scope: string): Promise<User[]> {
    return this.userService.findAll(scope);
  }

  @Get(':id')
  getUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('scope') scope: string,
  ) {
    return this.userService.findOne({ id }, scope);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', saveImgToStorage('avatars')))
  async patch(
    @Body('data') data: string,
    @UploadedFile()
    file: Express.Multer.File,
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const user: Partial<User> = JSON.parse(data);
    return await this.userService.updateUser(id, user, file);
  }
}
