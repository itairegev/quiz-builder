import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Shop ID',
    example: 'clx1234567890abcdef',
  })
  shopId: string;

  @ApiProperty({
    description: 'Shop domain',
    example: 'mystore.myshopify.com',
  })
  shopDomain: string;

  @ApiProperty({
    description: 'User permissions',
    example: ['read:quizzes', 'write:quizzes'],
    type: [String],
  })
  permissions: string[];
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: AuthUserResponseDto,
  })
  user: AuthUserResponseDto;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}

export class ShopifyValidationResponseDto {
  @ApiProperty({
    description: 'Token validation result',
    example: true,
  })
  valid: boolean;

  @ApiProperty({
    description: 'Shop information',
    example: {
      domain: 'mystore.myshopify.com',
      accessToken: 'shpat_...',
    },
  })
  shop: {
    domain: string;
    accessToken: string;
  };
}

export class ShopifyInstallResponseDto {
  @ApiProperty({
    description: 'Shopify app installation URL',
    example: 'https://mystore.myshopify.com/admin/oauth/authorize?client_id=...',
  })
  installUrl: string;
}
