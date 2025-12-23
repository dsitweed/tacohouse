import { IsNotEmpty, IsString } from 'class-validator';

export class RespondMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  response: string;
}

