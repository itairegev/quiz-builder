import { Module } from '@nestjs/common';
import { ShopifyAuthGuard } from './guards/shopify-auth.guard';

@Module({
  providers: [ShopifyAuthGuard],
  exports: [ShopifyAuthGuard],
})
export class AuthModule {}
