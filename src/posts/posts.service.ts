import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { uniqueSlug } from '../common/utils/slug.util.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';

const postInclude = {
  author: {
    select: { id: true, firstName: true, lastName: true, avatar: true },
  },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  _count: { select: { likes: true, comments: true } },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const slug = uniqueSlug(dto.title);
    const { tagIds, ...rest } = dto;

    return this.prisma.db.post.create({
      data: {
        ...rest,
        slug,
        authorId,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: postInclude,
    });
  }

  async findPublished(query: PostQueryDto) {
    const { page = 1, limit = 10, tag, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      status: PostStatus.PUBLISHED,
      isDeleted: false,
      ...(tag && { tags: { some: { tag: { slug: tag } } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      this.prisma.db.post.findMany({
        where,
        include: postInclude,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.db.post.count({ where }),
    ]);

    return {
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMine(authorId: string) {
    return this.prisma.db.post.findMany({
      where: { authorId, isDeleted: false },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.db.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED, isDeleted: false },
      include: postInclude,
    });
    if (!post) throw new NotFoundException('Post not found');

    // fire-and-forget view count increment
    this.prisma.db.post
      .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => null);

    return post;
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    await this.assertOwner(id, authorId);
    const { tagIds, ...rest } = dto;

    return this.prisma.db.post.update({
      where: { id },
      data: {
        ...rest,
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: postInclude,
    });
  }

  async publish(id: string, authorId: string) {
    await this.assertOwner(id, authorId);
    return this.prisma.db.post.update({
      where: { id },
      data: { status: PostStatus.PUBLISHED, publishedAt: new Date() },
      include: postInclude,
    });
  }

  async archive(id: string, authorId: string) {
    await this.assertOwner(id, authorId);
    return this.prisma.db.post.update({
      where: { id },
      data: { status: PostStatus.ARCHIVED },
      include: postInclude,
    });
  }

  async remove(id: string, authorId: string) {
    await this.assertOwner(id, authorId);
    await this.prisma.db.post.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async toggleLike(postId: string, userId: string) {
    await this.assertExists(postId);

    const existing = await this.prisma.db.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.db.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }

    await this.prisma.db.like.create({ data: { postId, userId } });
    return { liked: true };
  }

  async getLikes(postId: string, userId?: string) {
    await this.assertExists(postId);
    const count = await this.prisma.db.like.count({ where: { postId } });
    const liked = userId
      ? !!(await this.prisma.db.like.findUnique({
          where: { postId_userId: { postId, userId } },
        }))
      : false;

    return { count, liked };
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private async assertOwner(id: string, authorId: string) {
    const post = await this.assertExists(id);
    if (post.authorId !== authorId) throw new ForbiddenException();
    return post;
  }

  private async assertExists(id: string) {
    const post = await this.prisma.db.post.findFirst({
      where: { id, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
