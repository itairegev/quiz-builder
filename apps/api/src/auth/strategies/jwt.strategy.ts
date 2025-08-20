import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  shopId: string;
  shopDomain: string;
  permissions: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<JwtPayload> {
    // Validate token expiration
    if (payload.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Token has expired');
    }

    // Validate required fields
    if (!payload.sub || !payload.shopId || !payload.shopDomain) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Store user info in request for later use
    request['user'] = {
      id: payload.sub,
      email: payload.email,
      shopId: payload.shopId,
      shopDomain: payload.shopDomain,
      permissions: payload.permissions || [],
    };

    return payload;
  }
}
