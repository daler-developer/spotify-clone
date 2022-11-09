import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AlradyLikedException } from 'src/core/exceptions/already-liked-song.exception';
import {
  DidNotLikeSongException,
  SongNotFoundException,
} from 'src/core/exceptions/songs';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song-body.dto';
import { Song } from '@prisma/client';
import { AlbumsService } from 'src/albums/albums.service';
import { FindProfileSongsQueryDto } from './dto/find-profile-songs-query.dto';

@Injectable()
export class SongsService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService, // private albumsService: AlbumsService,
  ) {}

  async findUserSongs({ offset, userId }: { userId: number; offset: number }) {
    const songs = await this.prismaService.song.findMany({
      where: {
        creatorId: userId,
      },
      skip: offset,
      take: 10,
      include: {
        creator: true,
      },
    });

    return songs;
  }

  async findTrendingSongs({ offset }: { offset: number }) {
    const songs = await this.prismaService.song.findMany({
      orderBy: [
        {
          numListens: 'desc',
        },
        {
          numLikes: 'desc',
        },
      ],
      include: {
        creator: true,
      },
      skip: offset,
      take: 10,
    });

    return songs;
  }

  async likeSong({ songId, userId }: { songId: number; userId: number }) {
    const isAlreadyLiked = await this.checkIfUserLikedSong({ songId, userId });

    if (isAlreadyLiked) {
      throw new AlradyLikedException();
    }

    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        likers: {
          connect: {
            id: userId,
          },
        },
      },
    });

    await this.incrementSongNumLikes(songId);
  }

  async unlikeSong({ songId, userId }: { songId: number; userId: number }) {
    const isAlreadyLiked = await this.checkIfUserLikedSong({ songId, userId });

    if (!isAlreadyLiked) {
      throw new DidNotLikeSongException();
    }

    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        likers: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    await this.decrementSongNumLikes(songId);
  }

  async checkIfUserLikedSong({
    userId,
    songId,
  }: {
    userId: number;
    songId: number;
  }) {
    return !!(await this.prismaService.user.findFirst({
      where: {
        id: userId,
        songsLiked: {
          some: {
            id: songId,
          },
        },
      },
    }));
  }

  private async incrementSongNumLikes(songId: number) {
    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        numLikes: {
          increment: 1,
        },
      },
    });
  }

  private async decrementSongNumLikes(songId: number) {
    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        numLikes: {
          increment: -1,
        },
      },
    });
  }

  async createSong(
    data: CreateSongDto & {
      creator: User;
      image: Express.Multer.File;
      audio: Express.Multer.File;
    },
  ) {
    const imageUrl = await this.cloudinaryService.uploadFile(data.image);
    const audioUrl = await this.cloudinaryService.uploadFile(data.audio);

    const song = await this.prismaService.song.create({
      data: {
        artist: data.artist,
        name: data.name,
        imageUrl,
        audioUrl,
        creatorId: data.creator.id,
      },
      include: {
        creator: true,
      },
    });

    return song;
  }

  async findSongs() {
    const songs = await this.prismaService.song.findMany();

    return songs;
  }

  async incrementSongNumListens({ songId }: { songId: number }) {
    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        numListens: {
          increment: 1,
        },
      },
    });
  }

  async moveSongToAlbum({
    songId,
    albumId,
  }: {
    songId: number;
    albumId: number;
  }) {
    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        album: {
          connect: {
            id: albumId,
          },
        },
      },
    });

    // await this.albumsService.incrementAlbumNumSongs({ albumId });
  }

  async removeSongFromAlbum({ songId }: { songId: number }) {
    await this.prismaService.song.update({
      where: {
        id: songId,
      },
      data: {
        album: {
          disconnect: true,
        },
      },
    });

    // await this.albumsService.incrementAlbumNumSongs({ albumId });
  }

  async checkIfSongIsCreatedByUser({
    userId,
    songId,
  }: {
    userId: number;
    songId: number;
  }) {
    const song = await this.prismaService.song.findFirst({
      where: {
        id: songId,
        creatorId: userId,
      },
    });

    return !!song;
  }

  async checkIfSongExists({ songId }: { songId: number }) {
    const song = await this.prismaService.song.findFirst({
      where: { id: songId },
    });

    return !!song;
  }

  async failIfSongDoesNotExist({ songId }: { songId: number }) {
    if (!(await this.checkIfSongExists({ songId }))) {
      throw new SongNotFoundException();
    }
  }

  async deleteSong({ songId }: { songId: number }) {
    await this.prismaService.song.delete({
      where: {
        id: songId,
      },
    });
  }
}
