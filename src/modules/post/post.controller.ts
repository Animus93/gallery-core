import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from '../database/entities/post.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImgToStorage } from '../../helpers/image-storage';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('all')
  getPosts(
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<PostEntity[]> {
    const getOrder = order === 'ASC' ? 'ASC' : 'DESC';
    return this.postService.findAll(getOrder, sort);
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', saveImgToStorage('posts')))
  async create(
    @Body('data') data: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const post: PostEntity = JSON.parse(data);
    return await this.postService.createPost(post, file);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deletePost(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', saveImgToStorage('posts')))
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body('data') data: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const post: PostEntity = JSON.parse(data);
    return this.postService.updatePost(id, post, file);
  }
}
