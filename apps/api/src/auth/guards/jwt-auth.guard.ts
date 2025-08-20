import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('JWT token required');
    }

    try {
      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Store user info in request for later use
      request['user'] = {
        id: payload.sub,
        email: payload.email,
        shopId: payload.shopId,
        shopDomain: payload.shopDomain,
        permissions: payload.permissions || [],
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}
