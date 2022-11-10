import { HttpException, HttpStatus } from '@nestjs/common';

export class CommentNotFoundException extends HttpException {
  constructor() {
    super('Comment was not found', HttpStatus.NOT_FOUND);
  }
}

export class AlreadyLikedSongException extends HttpException {
  constructor() {
    super('You already liked this song', HttpStatus.BAD_REQUEST);
  }
}

export class DidNotLikeSongYetException extends HttpException {
  constructor() {
    super('You did not like song yet', HttpStatus.BAD_REQUEST);
  }
}
