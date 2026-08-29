import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrl {
  @ApiProperty({
    type: 'string',
    description:
      'URL để client PUT trực tiếp file lên storage. Hết hạn sau 300 giây.',
    example:
      'https://<account>.r2.cloudflarestorage.com/uploads/images/rooms/abc/1a2b.jpg?X-Amz-Signature=...',
  })
  uploadUrl: string;

  @ApiProperty({
    type: 'string',
    description:
      'URL công khai của file sau khi upload xong. Chỉ truy cập được với các purpose có visibility là public.',
    example: 'https://cdn.tacohouse.com/uploads/images/rooms/abc/1a2b.jpg',
  })
  fileUrl: string;

  @ApiProperty({
    type: 'string',
    description:
      'Object key trong bucket. Lưu lại giá trị này vào DB để gắn vào resource sau khi upload thành công.',
    example: 'uploads/images/rooms/abc/1a2b.jpg',
  })
  key: string;

  @ApiProperty({
    type: 'string',
    description:
      'ID của file trong frontend, dùng để map với presigned URL trả về. Không dùng để xác định quyền hay lưu trữ.',
    example: 'file-1234 hoặc uuid',
  })
  fileId: string;
}
