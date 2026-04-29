import {
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ShareService } from './share.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Share')
@Controller()
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post('posts/:id/share')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Generate a share link for a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  generate(
    @Param('id') postId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.shareService.generate(postId, user.id);
  }

  @Get('s/:code')
  @Redirect()
  @ApiOperation({ summary: 'Resolve a share link and redirect to post' })
  @ApiParam({ name: 'code', description: 'Share short code' })
  async resolve(@Param('code') code: string) {
    const { slug } = await this.shareService.resolve(code);
    return { url: `${process.env.APP_URL}/posts/${slug}`, statusCode: 302 };
  }
}
