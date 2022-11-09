import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UploadedFiles,
  Delete,
  Query,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import createSongBodySchema from './schemas/create-song-body.schema';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { ValidationException } from 'src/core/exceptions/validation.exception';
import { CreateSongDto } from './dto/create-song-body.dto';
import { SongsService } from './songs.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Express } from 'express';
import { User } from 'src/core/decorators/user.decorator';
import { User as UserEntity } from '@prisma/client';
import listenSongParamsSchema from './schemas/listen-song-params.schema';
import { ListenSongParamsDto } from './dto/listen-song-params.dto';
import addSongToAlbumBodySchema from './schemas/add-song-to-album-body.schema';
import { AddSongToAlbumBodyDto } from './dto/add-song-to-album-body.schema';
import { RemoveSongFromAlbumParamsDto } from './dto/remove-from-album-params.dto';
import removeFromAlbumParamsSchema from './schemas/remove-from-album-params.schema';
import { DeleteSongParamsDto } from './dto/delete-song-params.dto';
import deleteSongParamsSchema from './schemas/delete-song-params.schema';
import addSongToAlbumParamsSchema from './schemas/add-song-to-album-params.schema';
import { AddSongToAlbumParamsDto } from './dto/add-song-to-album-params.dto';
import findProfileSongsQuerySchema from './schemas/find-profile-songs-query.schema';
import { FindProfileSongsQueryDto } from './dto/find-profile-songs-query.dto';
import findUserSongsParamsSchema from './schemas/find-user-songs-params.schema';
import { FindUserSongsParamsDto } from './dto/find-user-songs-params.dto';
import findUserSongsQuerySchema from './schemas/find-user-songs-query.schema';
import { FindUserSongsQueryDto } from './dto/find-user-songs-query.dto';
import findTrendingSongsQuerySchema from './schemas/find-trending-songs/query.schema';
import { FindTrendingSongsQueryDto } from './dto/find-trending-songs/query.dto';

@Controller('/api')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Get('/trending/songs')
  async findTrendingSongs(
    @Query(new JoiValidationPipe(findTrendingSongsQuerySchema))
    query: FindTrendingSongsQueryDto,
  ) {
    const songs = await this.songsService.findTrendingSongs({
      offset: query.offset,
    });

    return { songs };
  }

  @Post('/songs')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async createSong(
    @Body(new JoiValidationPipe(createSongBodySchema)) body: CreateSongDto,
    @Request() req: Express.Request,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; audio?: Express.Multer.File[] },
  ) {
    if (!files.audio[0] || !files.image[0]) {
      throw new ValidationException();
    }

    const song = await this.songsService.createSong({
      ...body,
      image: files.image[0],
      audio: files.audio[0],
      creator: req.user as any,
    });

    return { song };
  }

  @Patch('/songs/:id/like')
  @UseGuards(JwtAuthGuard)
  async likeSong(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.songsService.failIfSongDoesNotExist({ songId: id });
    await this.songsService.likeSong({ songId: id, userId: user.id });

    return { liked: true };
  }

  @Patch('/songs/:id/unlike')
  @UseGuards(JwtAuthGuard)
  async unlikeSong(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.songsService.failIfSongDoesNotExist({ songId: id });
    await this.songsService.unlikeSong({ songId: id, userId: user.id });

    return { unliked: true };
  }

  @Get('/profile/songs')
  @UseGuards(JwtAuthGuard)
  async findProfileSongs(
    @Query(new JoiValidationPipe(findProfileSongsQuerySchema))
    query: FindProfileSongsQueryDto,
    @User() user: UserEntity,
  ) {
    const songs = await this.songsService.findUserSongs({
      userId: user.id,
      ...query,
    });

    return {
      songs,
    };
  }

  @Get('/users/:userId/songs')
  async findUserSongs(
    @Param(new JoiValidationPipe(findUserSongsParamsSchema))
    params: FindUserSongsParamsDto,
    @Query(new JoiValidationPipe(findUserSongsQuerySchema))
    query: FindUserSongsQueryDto,
  ) {
    const songs = await this.songsService.findUserSongs({
      userId: params.userId,
      offset: query.offset,
    });

    return {
      songs,
    };
  }

  @Patch('/songs/:id/listen')
  @UseGuards(JwtAuthGuard)
  async listenSong(
    @Param(new JoiValidationPipe(listenSongParamsSchema))
    params: ListenSongParamsDto,
  ) {
    await this.songsService.failIfSongDoesNotExist({ songId: params.id });
    await this.songsService.incrementSongNumListens({ songId: params.id });

    return { listened: true };
  }

  @Patch('/songs/:id/add-to-album')
  @UseGuards(JwtAuthGuard)
  async addSongToAlbum(
    @Body(new JoiValidationPipe(addSongToAlbumBodySchema))
    body: AddSongToAlbumBodyDto,
    @Param(new JoiValidationPipe(addSongToAlbumParamsSchema))
    params: AddSongToAlbumParamsDto,
  ) {
    await this.songsService.failIfSongDoesNotExist({ songId: params.id });
    await this.songsService.moveSongToAlbum({
      songId: params.id,
      albumId: body.albumId,
    });

    return { moved: true };
  }

  @Patch('/songs/:id/remove-from-album')
  @UseGuards(JwtAuthGuard)
  async removeSongFromAlbum(
    @Param(new JoiValidationPipe(removeFromAlbumParamsSchema))
    params: RemoveSongFromAlbumParamsDto,
  ) {
    await this.songsService.failIfSongDoesNotExist({ songId: params.id });
    await this.songsService.removeSongFromAlbum({ songId: params.id });

    return { removed: true };
  }

  @Delete('/songs/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSong(
    @Param(new JoiValidationPipe(deleteSongParamsSchema))
    params: DeleteSongParamsDto,
  ) {
    await this.songsService.failIfSongDoesNotExist({ songId: params.id });
    await this.songsService.deleteSong({ songId: params.id });

    return { deleted: true };
  }
}
