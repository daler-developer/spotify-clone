import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor() {
    super('Invalid data', HttpStatus.BAD_REQUEST);
  }
}
