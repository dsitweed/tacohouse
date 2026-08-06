import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { UserRole } from 'generated/prisma/enums';

export class UserProfileDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  lastName: string;

  @IsString()
  @MaxLength(10)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  occupation: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  workplace: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  idCardFrontPhoto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  idCardBackPhoto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  portraitPhoto?: string;
}

export class RegisterAuthDto extends UserProfileDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter and 1 number',
  })
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
