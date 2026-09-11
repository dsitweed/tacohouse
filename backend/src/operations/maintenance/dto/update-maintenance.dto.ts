import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  MaintenanceCategory,
  MaintenanceStatus,
  PriorityType,
} from 'generated/prisma/enums';

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
