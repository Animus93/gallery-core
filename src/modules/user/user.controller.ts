import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../database/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query('scope') scope: string): Promise<User[]> {
    return this.userService.findAll(scope);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    const userData = {
      firstName: req.user?.firstName || req.user?.user?.firstName,
      lastName: req.user?.lastName || req.user?.user?.lastName,
      roles: req.user?.roles || req.user?.user?.roles,
      isActive: req.user.isActive || req.user?.user?.isActive,
      lastOnlineAt: req.user?.lastOnlineAt || req.user?.user?.lastOnlineName,
      id: req.user?.id || req.user?.user?.id,
    };
    return userData;
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
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './avatars',
      fileFilter(
        req: any,
        file: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination: string;
          filename: string;
          path: string;
          buffer: Buffer;
        },
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) {},
    }),
  )
  async patch(
    @Body() data: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg|webp)',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file: File,
    // @Param('id', ParseIntPipe)
    // id: number,
  ) {
    console.log('!!Еest', {
      body: data,
      file,
    });
    // return await this.userService.updateUser(id, data);
  }
}
