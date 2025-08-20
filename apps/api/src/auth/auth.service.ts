import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shopify-quiz-builder/database';
import * as bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  shopId: string;
  shopDomain: string;
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string;
  email: string;
  shopId: string;
  shopDomain: string;
  permissions: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string, shopDomain: string): Promise<AuthUser> {
    // TODO: Implement actual user validation when User model is available
    // For now, return a mock user for development purposes
    if (email === 'admin@example.com' && password === 'password123' && shopDomain === 'mystore.myshopify.com') {
      return {
        id: 'mock-user-id',
        email: 'admin@example.com',
        shopId: 'mock-shop-id',
        shopDomain: 'mystore.myshopify.com',
        permissions: ['read:quizzes', 'write:quizzes', 'admin'],
      };
    }
    
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: AuthUser): Promise<LoginResponse> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      shopId: user.shopId,
      shopDomain: user.shopDomain,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      },
    );

    // TODO: Store refresh token in database when RefreshToken model is available
    // For now, just log the token for development purposes
    console.log('Refresh token generated:', refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // TODO: Verify token exists in database when RefreshToken model is available
      // For now, create a mock user for development purposes
      const user: AuthUser = {
        id: payload.sub,
        email: 'admin@example.com',
        shopId: 'mock-shop-id',
        shopDomain: 'mystore.myshopify.com',
        permissions: ['read:quizzes', 'write:quizzes', 'admin'],
      };

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // TODO: Remove refresh token from database when RefreshToken model is available
    // For now, just log the logout for development purposes
    console.log('User logged out:', userId);
  }

  async validateShopifyToken(shopDomain: string, accessToken: string): Promise<boolean> {
    try {
      // Verify Shopify access token by making a test API call
      const response = await fetch(`https://${shopDomain}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const shopData = await response.json();
      return shopData.shop && shopData.shop.domain === shopDomain;
    } catch (error) {
      return false;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    shopId: string;
    roleId?: string;
  }): Promise<AuthUser> {
    // TODO: Implement actual user creation when User model is available
    // For now, return a mock user for development purposes
    const mockUser: AuthUser = {
      id: 'mock-user-' + Date.now(),
      email: userData.email,
      shopId: userData.shopId,
      shopDomain: 'mystore.myshopify.com', // Mock domain
      permissions: ['read:quizzes', 'write:quizzes'],
    };

    console.log('Mock user created:', mockUser);
    return mockUser;
  }
}
