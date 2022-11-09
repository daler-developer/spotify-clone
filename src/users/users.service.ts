import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import UpdateMeBodyDto from 'src/auth/dto/update-me-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUser({
    password,
    username,
  }: {
    username: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return user;
  }

  async getUsers() {
    return await this.prismaService.user.findMany();
  }

  async findById(id: number) {
    const user = await this.prismaService.user.findMany({
      where: { id },
    });
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prismaService.user.findFirst({
      where: { username },
    });

    return user;
  }

  async findByUsernameOrFail(username: string) {
    const user = await this.findByUsername(username);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async checkIfUserWithUsernameExists(username: string) {
    return !!(await this.prismaService.user.findFirst({ where: { username } }));
  }

  async checkIfPasswordMatches({
    password,
    userId,
  }: {
    userId: number;
    password: string;
  }) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });
    const matches = await bcrypt.compare(password, user.password);

    if (matches) {
      return true;
    }

    return false;
  }

  async changeLang({ to, userId }: { to: 'RU' | 'EN'; userId: number }) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        lang: to,
      },
    });
  }

  async changeTheme({ to, userId }: { to: 'DARK' | 'LIGHT'; userId: number }) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        theme: to,
      },
    });
  }

  async updateUser({ username, userId }: UpdateMeBodyDto & { userId: number }) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
      },
    });
  }
}
