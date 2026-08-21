import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UploadPurpose } from 'uploads/upload.config';

export class FileInfoDto {
  @ApiProperty({
    type: 'string',
    description: 'Tên file gốc, dùng để lấy phần mở rộng cho object key.',
    example: 'phong-101.jpg',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({
    type: 'string',
    description:
      'MIME type của file. Phải nằm trong danh sách cho phép của purpose tương ứng.',
    example: 'image/jpeg',
  })
  @IsNotEmpty()
  @IsString()
  contentType: string;
}

export class CreatePresignedUrlsDto {
  @ApiProperty({
    type: () => FileInfoDto,
    isArray: true,
    description: 'Danh sách file cần upload. Tối đa 10 file mỗi request.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => FileInfoDto)
  files: FileInfoDto[];

  @ApiProperty({
    type: 'string',
    description:
      'ID của resource mà file thuộc về (roomId, buildingId, userId, paymentId...). Dùng để kiểm tra quyền và tạo đường dẫn lưu trữ.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @ApiProperty({
    enum: UploadPurpose,
    enumName: 'UploadPurpose',
    description:
      'Mục đích upload. Quyết định thư mục lưu trữ, quyền truy cập, giới hạn dung lượng và định dạng file cho phép.',
    example: UploadPurpose.ROOM_IMAGE,
  })
  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;
}
