import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => String(value).trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  password: string;
}
