import { RoomStatus, RoomType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsString()
  buildingId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  area: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  monthlyRent: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  deposit: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTenants: number = 1;

  @IsEnum(RoomType)
  roomType: RoomType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsEnum(RoomStatus)
  status: RoomStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  availableFrom?: Date;
}
