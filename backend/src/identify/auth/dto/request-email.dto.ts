import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
