import {
  MaintenanceCategory,
  MaintenanceStatus,
  PriorityType,
} from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PriorityType)
  priority?: PriorityType;

  @IsOptional()
  @IsEnum(MaintenanceCategory)
  category?: MaintenanceCategory;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  completionNote?: string;
}
