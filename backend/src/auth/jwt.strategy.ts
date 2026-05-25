import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tech-challenge-secret',
    });
  }

  async validate(payload: any) {
    // For MVP, we just validate the token payload. 
    // In a real app, we would look up the user in the database.
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, role: payload.role };
  }
}
