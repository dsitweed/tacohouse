import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class R2StorageService {
  private readonly s3Client: S3Client;
  private readonly privateBucketName: string;
  private readonly publicBucketName: string;
  private readonly publicDomain: string;

  constructor(config: ConfigService) {
    this.privateBucketName = config.get('CLOUDFLARE_R2_PRIVATE_BUCKET_NAME');
    this.publicBucketName = config.get('CLOUDFLARE_R2_PUBLIC_BUCKET_NAME');
    this.publicDomain = config.get('CLOUDFLARE_R2_PUBLIC_DOMAIN');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.get('CLOUDFLARE_R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get('CLOUDFLARE_R2_ACCESS_KEY_ID'),
        secretAccessKey: config.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createPresignedUploadUrl(
    uniqueKey: string,
    contentType: string,
    isPublic: boolean,
  ) {
    const command = new PutObjectCommand({
      Bucket: isPublic ? this.publicBucketName : this.privateBucketName,
      Key: uniqueKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 300 seconds
    });

    return {
      uploadUrl,
      fileUrl: `${this.publicDomain}/${uniqueKey}`,
      key: uniqueKey,
    };
  }

  async getSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.privateBucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 3600 seconds
    });
  }

  async createPresignedDownloadUrl(key: string) {}

  async delete(key: string) {}

  async exists(key: string) {}
}
