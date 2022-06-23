import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from './../prisma/prisma.service';
import { AuthDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {
    this.prisma = prisma;
  }
  async login(dto: AuthDTO) {
    const data = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: await hash(dto.password),
      },
      select: {
        id: true,
        createTime: true,
        updateTime: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });
    return {
      action: 'login',
      data,
    };
  }

  register(body: { username: string; password: string }) {
    return {
      action: 'rsgister',
      body,
    };
  }
}
