import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

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
