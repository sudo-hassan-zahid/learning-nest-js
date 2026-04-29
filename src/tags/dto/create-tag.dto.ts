import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;
}
