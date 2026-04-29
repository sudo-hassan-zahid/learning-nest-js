import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { TokenPairDto, UserProfileDto } from './dto/auth-response.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and immediately returns a JWT access + refresh token pair. Email must be unique.',
  })
  @ApiBody({ type: SignupDto })
  @ApiCreatedResponse({
    type: TokenPairDto,
    description: 'Account created — token pair issued',
  })
  @ApiConflictResponse({ description: 'Email already in use' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Authenticates an existing user and returns a fresh JWT access + refresh token pair.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: TokenPairDto,
    description: 'Login successful — token pair issued',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns the profile of the authenticated user decoded from the access token.',
  })
  @ApiOkResponse({ type: UserProfileDto, description: 'Current user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  me(@CurrentUser() user: Express.User) {
    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rotate refresh token',
    description:
      'Exchanges a valid refresh token for a new access + refresh token pair. The old refresh token is immediately invalidated (token rotation).',
  })
  @ApiOkResponse({ type: TokenPairDto, description: 'New token pair issued' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token missing, expired, or already used',
  })
  refresh(@CurrentUser() user: { id: string; rawRefreshToken: string }) {
    return this.authService.refresh(user.id, user.rawRefreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out',
    description:
      'Invalidates all refresh tokens for the current user. Access tokens remain valid until they expire.',
  })
  @ApiNoContentResponse({ description: 'Successfully logged out' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }
}
