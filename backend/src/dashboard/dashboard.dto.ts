import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateDashboardDto {}

export class UpdateDashboardDto {}

export class RevenueTrendQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  months = 6;
}
