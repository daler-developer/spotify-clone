import { HttpException, HttpStatus } from '@nestjs/common';

export class DidNotLikeSongException extends HttpException {
  constructor() {
    super('You did not like this post yet', HttpStatus.BAD_REQUEST);
  }
}

export class SongNotFoundException extends HttpException {
  constructor() {
    super('Song was not found', HttpStatus.NOT_FOUND);
  }
}
