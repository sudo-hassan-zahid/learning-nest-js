import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const CACHE_TTL = 60; // seconds
const ALL_KEY = 'users:all';
const userKey = (id: string) => `users:${id}`;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redis.get(ALL_KEY);
    if (cached) return JSON.parse(cached);

    const users = await this.prisma.db.user.findMany({
      where: { isDeleted: false },
      omit: { password: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.redis.set(ALL_KEY, JSON.stringify(users), CACHE_TTL);
    return users;
  }

  async findOne(id: string) {
    const cached = await this.redis.get(userKey(id));
    if (cached) return JSON.parse(cached);

    const user = await this.prisma.db.user.findFirst({
      where: { id, isDeleted: false },
      omit: { password: true },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.redis.set(userKey(id), JSON.stringify(user), CACHE_TTL);
    return user;
  }

  async update(id: string, requesterId: string, dto: UpdateUserDto) {
    if (id !== requesterId) throw new ForbiddenException();

    await this.findOne(id);

    const data: typeof dto & { password?: string } = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    const updated = await this.prisma.db.user.update({
      where: { id },
      data,
      omit: { password: true },
    });

    await this.redis.del(userKey(id), ALL_KEY);
    return updated;
  }

  async remove(id: string, requesterId: string) {
    if (id !== requesterId) throw new ForbiddenException();

    await this.findOne(id);

    await this.prisma.db.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.redis.del(userKey(id), ALL_KEY);
  }
}
