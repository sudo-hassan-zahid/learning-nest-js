import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.db.user.findMany({
      where: { isDeleted: false },
      omit: { password: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.db.user.findFirst({
      where: { id, isDeleted: false },
      omit: { password: true },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, requesterId: string, dto: UpdateUserDto) {
    if (id !== requesterId) throw new ForbiddenException();

    await this.findOne(id);

    const data: typeof dto & { password?: string } = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    return this.prisma.db.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async remove(id: string, requesterId: string) {
    if (id !== requesterId) throw new ForbiddenException();

    await this.findOne(id);

    await this.prisma.db.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
