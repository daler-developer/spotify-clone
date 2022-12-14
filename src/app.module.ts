import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SongsModule } from './songs/songs.module';
import { AlbumsModule } from './albums/albums.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [AuthModule, UsersModule, SongsModule, AlbumsModule, CommentsModule],
})
export class AppModule {}
