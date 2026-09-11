import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType, RelatedEntityType } from 'generated/prisma/enums';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsEnum(RelatedEntityType)
  relatedType?: RelatedEntityType;
}
