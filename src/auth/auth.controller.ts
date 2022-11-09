import {
  Controller,
  UseGuards,
  Post,
  Request,
  Body,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import CreateUserDto from './dto/create-user.dto';
import CreateUserSchema from './schemas/create-user.schema';
import { UsersService } from 'src/users/users.service';
import ChangeLangDto from './dto/change-lang-body.dto';
import changeLangSchema from './schemas/change-lang-body.schema';
import { User } from 'src/core/decorators/user.decorator';
import { User as UserEntity } from '@prisma/client';
import ChangeThemeBodyDto from './dto/change-theme-body.dto';
import changeThemeBodySchema from './schemas/change-theme-body.schema';
import updateMeBodySchema from './schemas/update-me-body.schema';
import UpdateMeBodyDto from './dto/update-me-body.dto';

@Controller('/api')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get('/auth/me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('local'))
  @Post('/auth/login')
  async login(@Request() req: any) {
    const accessToken = this.jwtService.sign({ userId: req.user.id });

    return {
      accessToken,
      user: req.user,
    };
  }

  @Post('/auth/register')
  async register(
    @Body(new JoiValidationPipe(CreateUserSchema)) body: CreateUserDto,
  ) {
    const result = await this.authService.register(body);

    return result;
  }

  @Patch('/auth/change-lang')
  @UseGuards(JwtAuthGuard)
  async changeLang(
    @Body(new JoiValidationPipe(changeLangSchema)) body: ChangeLangDto,
    @User() user: UserEntity,
  ) {
    await this.usersService.changeLang({ userId: user.id, to: body.lang });

    return { changed: true };
  }

  @Patch('/auth/change-theme')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  async changeTheme(
    @Body(new JoiValidationPipe(changeThemeBodySchema))
    body: ChangeThemeBodyDto,
    @User() user: UserEntity,
  ) {
    await this.usersService.changeTheme({ userId: user.id, to: body.theme });

    return { changed: true };
  }

  @Patch('/auth/update-me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Body(new JoiValidationPipe(updateMeBodySchema)) body: UpdateMeBodyDto,
    @User() user: UserEntity,
  ) {
    await this.usersService.updateUser({
      userId: user.id,
      username: body.username,
    });

    return { updated: true };
  }
}
