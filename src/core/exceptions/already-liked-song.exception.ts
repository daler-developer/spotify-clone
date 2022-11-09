import { HttpException, HttpStatus } from '@nestjs/common';

export class AlradyLikedException extends HttpException {
  constructor() {
    super('You already liked song', HttpStatus.BAD_REQUEST);
  }
}
