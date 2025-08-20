import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService, AuthUser, LoginResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ShopifyAuthGuard } from './guards/shopify-auth.guard';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto,
  LoginResponseDto,
  AuthUserResponseDto,
  ShopifyValidationResponseDto,
  ShopifyInstallResponseDto
} from './dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.shopDomain,
    );

    return this.authService.login(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.authService.createUser({
      email: registerDto.email,
      password: registerDto.password,
      shopId: registerDto.shopId,
      roleId: registerDto.roleId,
    });

    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'User logout' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: any): Promise<void> {
    await this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    type: AuthUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: any): Promise<AuthUser> {
    return req.user;
  }

  @Post('shopify/validate')
  @UseGuards(ShopifyAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate Shopify access token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  @ApiResponse({ status: 401, description: 'Invalid Shopify token' })
  async validateShopifyToken(@Request() req: any): Promise<ShopifyValidationResponseDto> {
    const shop = req.shop;
    const isValid = await this.authService.validateShopifyToken(
      shop.domain,
      shop.accessToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid Shopify access token');
    }

    return {
      valid: true,
      shop: {
        domain: shop.domain,
        accessToken: shop.accessToken,
      },
    };
  }

  @Get('shopify/install')
  @ApiOperation({ summary: 'Initiate Shopify app installation' })
  @ApiResponse({ status: 200, description: 'Installation URL' })
  async initiateShopifyInstall(@Request() req: any): Promise<ShopifyInstallResponseDto> {
    const shop = req.query.shop;
    if (!shop) {
      throw new UnauthorizedException('Shop parameter required');
    }

    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_APP_URL}/auth/shopify/callback&state=${Math.random().toString(36).substring(7)}`;

    return { installUrl };
  }
}
