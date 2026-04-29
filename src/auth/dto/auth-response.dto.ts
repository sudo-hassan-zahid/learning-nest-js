import { ApiProperty } from '@nestjs/swagger';

export class TokenPairDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Short-lived JWT access token (default 15 min). Send as `Authorization: Bearer <token>`.',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Long-lived JWT refresh token (default 7 days). Use POST /auth/refresh to rotate.',
  })
  refreshToken!: string;
}

export class UserProfileDto {
  @ApiProperty({
    example: 'cuid2abc123',
    description: 'Unique user ID (CUID2)',
  })
  id!: string;

  @ApiProperty({ example: 'Jane', description: 'First name' })
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName!: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Email address' })
  email!: string;

  @ApiProperty({ example: true, description: 'Whether the account is active' })
  isActive!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the account has been soft-deleted',
  })
  isDeleted!: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Account creation timestamp',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2024-06-01T08:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt!: string;
}
