import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllMessagesDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  limit?: number = 50;

  @IsOptional()
  @IsString()
  before?: string; // Message ID for pagination
}

