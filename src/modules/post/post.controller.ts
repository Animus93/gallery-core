import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from '../database/entities/post.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getPosts(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() data: PostEntity, @UploadedFile() file: Express.Multer.File) {
    // const user = this.postService.createPost(data);
    // return instanceToPlain(user);
    console.log('body', data);
    console.log('img', file);
    return 'POSTED';
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deletePost(id);
  }

  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() data: PostEntity) {
    return this.postService.updatePost(id, data);
  }
}
