import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '@tacohouse/shared';

export class FindAllNotificationsDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRead?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

