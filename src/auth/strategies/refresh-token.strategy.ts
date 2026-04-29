import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const token = (req.headers as unknown as Record<string, string>)[
      'authorization'
    ]?.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    const user = await this.prisma.db.user.findFirst({
      where: { id: payload.sub, isDeleted: false },
    });

    if (!user) throw new UnauthorizedException();

    const { password: _, ...result } = user;
    return { ...result, rawRefreshToken: token };
  }
}
