import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { UploadPurpose } from '../upload.config';

export class DeleteObjectDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;

  @IsNotEmpty()
  @IsString()
  resourceId: string;
}
