import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ShopifyOAuthStrategy } from './strategies/shopify-oauth.strategy';
import { ShopifyAuthGuard } from './guards/shopify-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ShopifyOAuthStrategy,
    ShopifyAuthGuard,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    ShopifyOAuthStrategy,
    ShopifyAuthGuard,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
