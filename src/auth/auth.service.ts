import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { MailService } from '../mail/mail.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.db.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.db.user.create({
      data: { ...dto, password: hashed },
    });

    this.mail.sendWelcome(user.email, user.firstName).catch(() => null);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.db.user.findFirst({
      where: { email: dto.email, isDeleted: false },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  async refresh(userId: string, rawRefreshToken: string) {
    const stored = await this.prisma.db.refreshToken.findFirst({
      where: { userId, expiresAt: { gt: new Date() } },
    });

    if (!stored) throw new UnauthorizedException();

    const valid = await bcrypt.compare(rawRefreshToken, stored.tokenHash);
    if (!valid) throw new UnauthorizedException();

    await this.prisma.db.refreshToken.delete({ where: { id: stored.id } });

    const user = await this.prisma.db.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return this.issueTokens(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.db.user.findFirst({
      where: { email, isDeleted: false },
    });
    // always return success to prevent email enumeration
    if (!user) return;

    const token = randomUUID();
    await this.redis.set(`reset:${token}`, user.id, 15 * 60); // 15 min TTL
    this.mail
      .sendForgotPassword(user.email, user.firstName, token)
      .catch(() => null);
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get(`reset:${token}`);
    if (!userId)
      throw new UnauthorizedException('Reset link is invalid or has expired');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.db.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    await this.redis.del(`reset:${token}`);
  }

  async deleteAccount(userId: string, rawAccessToken?: string) {
    const user = await this.prisma.db.user.findUniqueOrThrow({
      where: { id: userId },
    });

    await this.prisma.db.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });

    // revoke all sessions
    await this.logout(userId, rawAccessToken);

    this.mail.sendAccountDeleted(user.email, user.firstName).catch(() => null);
  }

  async logout(userId: string, rawAccessToken?: string) {
    await this.prisma.db.refreshToken.deleteMany({ where: { userId } });

    if (rawAccessToken) {
      const payload = this.jwt.decode(rawAccessToken) as {
        jti?: string;
        exp?: number;
      } | null;

      if (payload?.jti && payload.exp) {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.set(`blacklist:${payload.jti}`, '1', ttl);
        }
      }
    }
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const jti = randomUUID();
    const payload = { sub: user.id, email: user.email, jti };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
    });

    const refreshToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
      },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.db.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const {
      id,
      email,
      firstName,
      lastName,
      isActive,
      isDeleted,
      createdAt,
      updatedAt,
    } = user;
    return {
      accessToken,
      refreshToken,
      user: {
        id,
        email,
        firstName,
        lastName,
        isActive,
        isDeleted,
        createdAt,
        updatedAt,
      },
    };
  }
}
