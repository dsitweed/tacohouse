import { PartialType, PickType } from '@nestjs/mapped-types';
import { RegisterAuthDto, UserProfileDto } from 'auth/dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserProfileDto extends PartialType(UserProfileDto) {}

export class UpdatePasswordDto extends PickType(RegisterAuthDto, [
  'password',
] as const) {
  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  currentPassword: string;

  // password: string; extend from RegisterAuthDto

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  confirmPassword: string;
}
