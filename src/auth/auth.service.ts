import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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

  async logout(userId: string) {
    await this.prisma.db.refreshToken.deleteMany({ where: { userId } });
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
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
    });

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
