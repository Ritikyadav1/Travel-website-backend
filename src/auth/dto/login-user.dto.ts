/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  identifier: string; 

  @IsString()
  @MinLength(6)
  password: string;
}
