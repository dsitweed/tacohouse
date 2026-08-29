import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User, UserRole } from 'generated/prisma/client';
import { extname } from 'path';
import { PrismaService } from 'prisma/prisma.service';
import { R2StorageService } from 'storage/r2-storage.service';

import { CreatePresignedUrlsDto } from './dto/create-presigned-urls.dto';
import { DeleteObjectDto } from './dto/delete-object.dto';
import { DeleteObjectsByPrefixDto } from './dto/delete-objects-by-prefix.dto';
import { PresignedUrl } from './entities/presigned-url.entity';
import { UPLOAD_CONFIG, UploadPurpose } from './upload.config';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: R2StorageService,
  ) {}
  /**
   * resourceType
      ↓
  validate
        ↓
  check permission
        ↓
  check contentType
        ↓
  generate object key
        ↓
  generate presigned URL
        ↓
  return URL + key
   * @param currentUser 
   * @param createPresignedUrlsDto 
   */
  async presignedUrls(
    currentUser: User,
    createPresignedUrlsDto: CreatePresignedUrlsDto,
  ): Promise<PresignedUrl[]> {
    const { files, resourceId, purpose } = createPresignedUrlsDto;
    const config = UPLOAD_CONFIG[purpose];

    const isHavePermission = await this.checkPermission(
      currentUser,
      purpose,
      resourceId,
    );

    if (!isHavePermission) {
      throw new ForbiddenException(
        'You do not have permission to upload this file.',
      );
    }

    const invalidFile = files.find(
      (file) => !config.allowedContentTypes.includes(file.contentType),
    );

    if (invalidFile) {
      throw new BadRequestException(
        `Invalid content type ${invalidFile.contentType} for this upload purpose`,
      );
    }

    const isPublic = config.visibility === 'public';

    return Promise.all(
      files.map((file) => {
        const uniqueKey = `${config.folderPath}/${resourceId}/${randomUUID()}${extname(file.fileName)}`;
        return this.storageService.createPresignedUploadUrl(
          uniqueKey,
          file.contentType,
          file.fileId,
          isPublic,
        );
      }),
    );
  }

  async deleteObject(user: User, deleteObjectDto: DeleteObjectDto) {
    const { purpose, resourceId, key } = deleteObjectDto;
    const isHavePermission = await this.checkPermission(
      user,
      purpose,
      resourceId,
    );

    if (!isHavePermission) {
      throw new ForbiddenException(
        'You do not have permission to delete this file.',
      );
    }

    return this.storageService.deleteObject(
      key,
      UPLOAD_CONFIG[purpose].visibility === 'public',
    );
  }

  async deleteObjectsByPrefix(
    user: User,
    deleteObjectByPrefixDto: DeleteObjectsByPrefixDto,
  ) {
    const { purpose, resourceId, prefix } = deleteObjectByPrefixDto;
    const isHavePermission = await this.checkPermission(
      user,
      purpose,
      resourceId,
    );

    if (!isHavePermission) {
      throw new ForbiddenException(
        'You do not have permission to delete this file.',
      );
    }

    return this.storageService.deleteObjectsByPrefix(
      prefix,
      UPLOAD_CONFIG[purpose].visibility === 'public',
    );
  }

  async checkPermission(
    currentUser: User,
    purpose: UploadPurpose,
    resourceId: string,
  ): Promise<boolean> {
    if (currentUser.role === UserRole.ADMIN) return true;

    switch (purpose) {
      case UploadPurpose.BUILDING_IMAGE: {
        const building = await this.prisma.building.findUnique({
          where: { id: resourceId, landlordId: currentUser.id },
        });
        return !!building;
      }
      case UploadPurpose.ROOM_IMAGE: {
        const room = await this.prisma.room.findUnique({
          where: {
            id: resourceId,
            building: {
              landlordId: currentUser.id,
            },
          },
        });
        return !!room;
      }
      case UploadPurpose.USER_AVATAR:
      case UploadPurpose.USER_ID_CARD_FRONT_PHOTO:
      case UploadPurpose.USER_ID_CARD_BACK_PHOTO:
      case UploadPurpose.USER_PORTRAIT_PHOTO: {
        return currentUser.id === resourceId;
      }
      case UploadPurpose.PAYMENT_RECEIPT_IMAGE: {
        const payment = await this.prisma.payment.findUnique({
          where: {
            id: resourceId,
            bill: {
              room: {
                rentals: {
                  some: {
                    tenantId: currentUser.id,
                    status: 'ACTIVE',
                  },
                },
              },
            },
          },
        });

        return !!payment;
      }

      default:
        return false;
    }
  }
}
