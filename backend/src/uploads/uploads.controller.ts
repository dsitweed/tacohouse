import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'common/decorators';
import type { User } from 'generated/prisma/client';

import { CreatePresignedUrlsDto } from './dto/create-presigned-urls.dto';
import { DeleteObjectDto } from './dto/delete-object.dto';
import { DeleteObjectsByPrefixDto } from './dto/delete-objects-by-prefix.dto';
import { PresignedUrl } from './entities/presigned-url.entity';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-urls')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Tạo presigned URL để upload file trực tiếp lên storage',
  })
  @ApiBody({ type: CreatePresignedUrlsDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo presigned URL thành công.',
    type: PresignedUrl,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu không hợp lệ hoặc `contentType` không được phép với `purpose` đã chọn.',
  })
  presignedUrls(
    @CurrentUser() currentUser: User,
    @Body() createPresignedUrlsDto: CreatePresignedUrlsDto,
  ) {
    return this.uploadsService.presignedUrls(
      currentUser,
      createPresignedUrlsDto,
    );
  }

  @Delete('object')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Xóa một file từ storage dựa trên key',
  })
  deleteObject(
    @CurrentUser() user: User,
    @Query() deleteObjectDto: DeleteObjectDto,
  ) {
    return this.uploadsService.deleteObject(user, deleteObjectDto);
  }

  @Delete('prefix')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Xóa các file từ storage dựa trên prefix',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa file thành công.',
  })
  deleteObjectsByPrefix(
    @CurrentUser() user: User,
    @Query() deleteObjectsByPrefix: DeleteObjectsByPrefixDto,
  ) {
    return this.uploadsService.deleteObjectsByPrefix(
      user,
      deleteObjectsByPrefix,
    );
  }
}
