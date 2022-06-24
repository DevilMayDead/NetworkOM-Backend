import { Injectable, ForbiddenException } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from './../prisma/prisma.service';
import { AuthDTO } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { throwError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private pwt: JwtService,
    private config: ConfigService,
  ) {}

  async loginToken(userId: number, username: string) {
    const token = this.pwt.sign(
      {
        sub: userId,
        username,
      },
      {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      },
    );
    return token;
  }

  async login(dto: AuthDTO) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) throw new ForbiddenException('用户名不存在');

    const pwMatches = await verify(user.password, dto.password);
    if (!pwMatches) throw new ForbiddenException('密码错误');

    delete user.password;

    return {
      action: 'login',
      token: await this.loginToken(user.id, user.username),
    };
  }

  async register(dto: AuthDTO) {
    try {
      if (
        await this.prisma.user.findUnique({ where: { username: dto.username } })
      )
        throw new ForbiddenException('用户名已存在');

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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code === 'P2002')
          throw new ForbiddenException('用户名已存在');

      throwError;
    }
  }
}
