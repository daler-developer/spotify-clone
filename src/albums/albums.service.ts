import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlbumBodyDto } from './dto/create-album-body.dto';

@Injectable()
export class AlbumsService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private prismaService: PrismaService,
  ) {}

  async createAlbum({
    image,
    name,
    creatorId,
  }: CreateAlbumBodyDto & { image: Express.Multer.File; creatorId: number }) {
    const imageUrl = await this.cloudinaryService.uploadFile(image);

    const album = await this.prismaService.album.create({
      data: {
        name,
        imageUrl,
        creatorId,
      },
      include: {
        creator: true,
      },
    });

    return album;
  }

  async findAlbums() {
    const albums = await this.prismaService.album.findMany({
      include: {
        songs: true,
      },
    });

    return albums;
  }

  async incrementAlbumNumSongs({ albumId }: { albumId: number }) {
    await this.prismaService.album.update({
      where: {
        id: albumId,
      },
      data: {
        numSongs: {
          increment: 1,
        },
      },
    });
  }

  async decrementAlbumNumSongs({ albumId }: { albumId: number }) {
    await this.prismaService.album.update({
      where: {
        id: albumId,
      },
      data: {
        numSongs: {
          increment: -1,
        },
      },
    });
  }
}
