import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { shortCode } from '../common/utils/slug.util.js';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(postId: string, requesterId: string) {
    const post = await this.prisma.db.post.findFirst({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== requesterId) throw new ForbiddenException();

    const code = shortCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const link = await this.prisma.db.shareLink.create({
      data: { postId, shortCode: code, expiresAt },
    });

    return {
      shortCode: link.shortCode,
      url: `${process.env.APP_URL}/s/${link.shortCode}`,
      expiresAt: link.expiresAt,
    };
  }

  async resolve(code: string) {
    const link = await this.prisma.db.shareLink.findUnique({
      where: { shortCode: code },
      include: { post: { select: { slug: true, isDeleted: true } } },
    });

    if (!link || (link.expiresAt && link.expiresAt < new Date())) {
      throw new NotFoundException('Share link not found or expired');
    }
    if (link.post.isDeleted) throw new NotFoundException('Post not found');

    return { slug: link.post.slug };
  }
}
