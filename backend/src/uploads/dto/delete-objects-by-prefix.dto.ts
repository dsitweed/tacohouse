import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UploadPurpose } from 'uploads/upload.config';

export class DeleteObjectsByPrefixDto {
  @IsNotEmpty()
  @IsString()
  prefix: string;

  @IsNotEmpty()
  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;

  @IsNotEmpty()
  @IsString()
  resourceId: string;
}
