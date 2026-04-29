import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jane@example.com',
    description: "User's registered email",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password1234!', description: "User's password" })
  @IsString()
  password!: string;
}
