import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, BookmarkModule],
  providers: [PrismaService],
})
export class AppModule {}
