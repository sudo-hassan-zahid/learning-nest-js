import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { TokenPairDto, UserProfileDto } from './dto/auth-response.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import {
  AuthThrottle,
  RefreshThrottle,
} from '../common/decorators/throttle.decorator.js';

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function setTokenCookies(res: Response, tokens: TokenPairDto) {
  res.cookie('accessToken', tokens.accessToken, {
    ...COOKIE_DEFAULTS,
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...COOKIE_DEFAULTS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/auth/refresh',
  });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @AuthThrottle()
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sets `accessToken` + `refreshToken` as HTTP-only cookies. Email must be unique.',
  })
  @ApiBody({ type: SignupDto })
  @ApiCreatedResponse({
    type: TokenPairDto,
    description: 'Account created — cookies set',
  })
  @ApiConflictResponse({ description: 'Email already in use' })
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signup(dto);
    setTokenCookies(res, tokens);
    return tokens;
  }

  @Post('login')
  @AuthThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Authenticates an existing user and sets `accessToken` + `refreshToken` as HTTP-only cookies.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: TokenPairDto,
    description: 'Login successful — cookies set',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    setTokenCookies(res, tokens);
    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns the profile of the authenticated user. Reads the `accessToken` cookie.',
  })
  @ApiOkResponse({ type: UserProfileDto, description: 'Current user profile' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token cookie',
  })
  me(@CurrentUser() user: Express.User) {
    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @RefreshThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Rotate refresh token',
    description:
      'Reads the `refreshToken` cookie, issues a new token pair, and updates both cookies. The old refresh token is immediately invalidated.',
  })
  @ApiOkResponse({
    type: TokenPairDto,
    description: 'New token pair issued — cookies updated',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token cookie missing, expired, or already used',
  })
  async refresh(
    @CurrentUser() user: { id: string; rawRefreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(
      user.id,
      user.rawRefreshToken,
    );
    setTokenCookies(res, tokens);
    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Log out',
    description:
      'Invalidates all refresh tokens for the current user and clears both auth cookies.',
  })
  @ApiNoContentResponse({
    description: 'Successfully logged out — cookies cleared',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token cookie',
  })
  async logout(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
  }
}
