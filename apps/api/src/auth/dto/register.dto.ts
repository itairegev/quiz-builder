import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Shop ID',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @ApiPropertyOptional({
    description: 'Role ID (optional)',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}
