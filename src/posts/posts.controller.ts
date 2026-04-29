import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ─── authenticated ───────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Create a draft post' })
  create(@Body() dto: CreatePostDto, @CurrentUser() user: { id: string }) {
    return this.postsService.create(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'List my posts (includes drafts)' })
  findMine(@CurrentUser() user: { id: string }) {
    return this.postsService.findMine(user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Publish a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  publish(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.postsService.publish(id, user.id);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Archive a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  archive(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.postsService.archive(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Post deleted' })
  @ApiOperation({ summary: 'Delete a post (soft)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.postsService.remove(id, user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Toggle like on a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  toggleLike(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.postsService.toggleLike(id, user.id);
  }

  // ─── public ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published posts' })
  findAll(@Query() query: PostQueryDto) {
    return this.postsService.findPublished(query);
  }

  @Get(':id/likes')
  @ApiOperation({ summary: 'Get like count for a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  getLikes(@Param('id') id: string) {
    return this.postsService.getLikes(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published post by slug' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  findOne(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }
}
