import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(credentials: any) {
    const user = await this.usersService.createUser(credentials);
    const accessToken = this.jwtService.sign({ userId: user.id });

    return { user, accessToken };
  }
}
