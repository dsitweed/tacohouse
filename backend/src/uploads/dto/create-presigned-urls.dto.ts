import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { UploadPurpose } from 'uploads/upload.config';

class FileInfoDto {
  @IsString()
  fileName: string;

  @IsString()
  contentType: string;
}

export class CreatePresignedUrlsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileInfoDto)
  file: FileInfoDto;

  resourceId: string;

  purpose: UploadPurpose;
}
