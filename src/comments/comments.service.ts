import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

const authorSelect = {
  select: { id: true, firstName: true, lastName: true, avatar: true },
};

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.prisma.db.post.findFirst({
      where: { id: postId, isDeleted: false },
      include: { author: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.prisma.db.comment.create({
      data: { content: dto.content, postId, authorId, parentId: dto.parentId },
      include: { author: authorSelect },
    });

    // notify post author (skip if they're commenting on their own post)
    if (post.authorId !== authorId) {
      const commenter = await this.prisma.db.user.findUnique({
        where: { id: authorId },
        select: { firstName: true, lastName: true },
      });
      const name = `${commenter?.firstName} ${commenter?.lastName}`;
      const postUrl = `${process.env.APP_URL}/posts/${post.slug}`;
      this.mail
        .sendNewComment(post.author.email, post.title, name, postUrl)
        .catch(() => null);
    }

    return comment;
  }

  async findByPost(postId: string) {
    const exists = await this.prisma.db.post.findFirst({
      where: { id: postId, isDeleted: false },
    });
    if (!exists) throw new NotFoundException('Post not found');

    const comments = await this.prisma.db.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: authorSelect,
        replies: {
          where: { isDeleted: false },
          include: { author: authorSelect },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // mask deleted comments without removing them (thread integrity)
    return comments.map((c) => this.maskDeleted(c));
  }

  async update(id: string, authorId: string, dto: UpdateCommentDto) {
    await this.assertOwner(id, authorId);
    return this.prisma.db.comment.update({
      where: { id },
      data: { content: dto.content },
      include: { author: authorSelect },
    });
  }

  async remove(id: string, authorId: string) {
    await this.assertOwner(id, authorId);
    await this.prisma.db.comment.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private async assertOwner(id: string, authorId: string) {
    const comment = await this.prisma.db.comment.findUnique({ where: { id } });
    if (!comment || comment.isDeleted) throw new NotFoundException('Comment not found');
    if (comment.authorId !== authorId) throw new ForbiddenException();
    return comment;
  }

  private maskDeleted<T extends { isDeleted: boolean; content: string; replies?: any[] }>(
    comment: T,
  ): T {
    return {
      ...comment,
      content: comment.isDeleted ? '[deleted]' : comment.content,
      replies: comment.replies?.map((r) => this.maskDeleted(r)),
    };
  }
}
