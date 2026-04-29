import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Jane', description: "User's first name" })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: "User's last name" })
  @IsString()
  lastName!: string;

  @ApiProperty({
    example: 'jane@example.com',
    description: "User's email address",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password1234!',
    description: 'Password — minimum 8 characters',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
