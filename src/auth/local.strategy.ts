import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidationException } from 'src/core/exceptions/validation.exception';
import { UsersService } from 'src/users/users.service';
import loginBodySchema from './schemas/login-body.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const { error, value: validatedCredentials } = loginBodySchema.validate({
      username,
      password,
    });
    if (error) {
      throw new ValidationException();
    }
    const user = await this.usersService.findByUsernameOrFail(
      validatedCredentials.username,
    );
    const passwordDoesNotMatch =
      !(await this.usersService.checkIfPasswordMatches({
        userId: user.id,
        password: validatedCredentials.password,
      }));
    if (passwordDoesNotMatch) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
