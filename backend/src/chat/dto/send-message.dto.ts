import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MessageType } from '@tacohouse/shared';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;
}

