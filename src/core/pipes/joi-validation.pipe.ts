import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error, value: newValue } = this.schema.validate(value);
    if (error) {
      throw new ValidationException();
    }
    return newValue;
  }
}
