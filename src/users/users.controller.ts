import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description:
      'Returns all active (non-deleted) users ordered by creation date descending. Password is never included.',
  })
  @ApiOkResponse({
    type: [UserProfileDto],
    description: 'Array of user profiles',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Returns the profile of a single active user. Throws 404 if not found or soft-deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'CUID2 user ID',
    example: 'cuid2abc123',
  })
  @ApiOkResponse({ type: UserProfileDto, description: 'User profile' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates profile fields for the specified user. Only the owner can update their own account. All fields are optional — send only what you want to change.',
  })
  @ApiParam({
    name: 'id',
    description: 'CUID2 user ID',
    example: 'cuid2abc123',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserProfileDto, description: 'Updated user profile' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: "Cannot update another user's profile" })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Soft-deletes the specified user account (sets `isDeleted = true`, records `deletedAt`). Only the owner can delete their own account. The record is retained in the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'CUID2 user ID',
    example: 'cuid2abc123',
  })
  @ApiNoContentResponse({ description: 'Account soft-deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: "Cannot delete another user's account" })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.usersService.remove(id, user.id);
  }
}
