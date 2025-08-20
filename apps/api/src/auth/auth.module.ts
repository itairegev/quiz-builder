import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopifyModule } from '../shopify/shopify.module';
import { ShopifyAuthGuard } from './guards/shopify-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from './jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        secretOrPrivateKey: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
    ShopifyModule,
  ],
  providers: [ShopifyAuthGuard, JwtAuthGuard, JwtService],
  exports: [ShopifyAuthGuard, JwtAuthGuard, JwtService],
})
export class AuthModule {}
