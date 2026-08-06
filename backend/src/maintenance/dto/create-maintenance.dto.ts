import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MaintenanceCategory, PriorityType } from 'generated/prisma/enums';

export class CreateMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(PriorityType)
  priority: PriorityType;

  @IsNotEmpty()
  @IsEnum(MaintenanceCategory)
  category: MaintenanceCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
