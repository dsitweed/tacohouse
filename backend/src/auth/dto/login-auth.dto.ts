import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @Transform(({ value }) => String(value).trim())
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
