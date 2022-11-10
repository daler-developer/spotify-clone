import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SongsModule } from 'src/songs/songs.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [PrismaModule, SongsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
