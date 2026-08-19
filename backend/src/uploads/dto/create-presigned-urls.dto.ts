import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
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
  files: FileInfoDto[];

  @IsString()
  resourceId: string;

  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;
}
