import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'common/decorators';
import type { User } from 'generated/prisma/client';

import { CreatePresignedUrlsDto } from './dto/create-presigned-urls.dto';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
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

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createUploadDto: CreateUploadDto) {
    return this.uploadsService.create(createUploadDto);
  }

  @Get()
  @ApiExcludeEndpoint()
  findAll() {
    return this.uploadsService.findAll();
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(+id);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(+id, updateUploadDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(+id);
  }
}
