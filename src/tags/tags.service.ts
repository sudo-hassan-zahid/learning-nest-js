import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toSlug } from '../common/utils/slug.util.js';
import { CreateTagDto } from './dto/create-tag.dto.js';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateTagDto) {
    const slug = toSlug(dto.name);
    const exists = await this.prisma.db.tag.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('Tag already exists');
    return this.prisma.db.tag.create({ data: { name: dto.name, slug } });
  }
}
