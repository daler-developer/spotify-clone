import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/core/decorators/user.decorator';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { User as UserEntity } from '@prisma/client';
import { AlbumsService } from './albums.service';
import { CreateAlbumBodyDto } from './dto/create-album-body.dto';
import createAlbumBodySchema from './schemas/create-album-body.schema';

@Controller('/api')
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  @Post('/albums')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createAlbum(
    @User() user: UserEntity,
    @UploadedFile() image: Express.Multer.File,
    @Body(new JoiValidationPipe(createAlbumBodySchema))
    body: CreateAlbumBodyDto,
  ) {
    const album = await this.albumsService.createAlbum({
      ...body,
      image,
      creatorId: user.id,
    });

    return { album };
  }

  @Get('/albums')
  async getAlbums() {
    return {
      albums: await this.albumsService.findAlbums(),
    };
  }
}
