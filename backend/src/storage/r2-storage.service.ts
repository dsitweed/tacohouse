import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignedUrl } from 'uploads/entities/presigned-url.entity';

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
    fileId: string,
    isPublic: boolean,
  ): Promise<PresignedUrl> {
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
      fileId,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createPresignedDownloadUrl(key: string) {}

  async deleteObject(objectKey: string, isPublic: boolean) {
    const bucket = isPublic ? this.publicBucketName : this.privateBucketName;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      }),
    );
  }

  async deleteObjectsByPrefix(prefixKey: string, isPublic: boolean) {
    const bucket = isPublic ? this.publicBucketName : this.privateBucketName;
    let continuationToken: string | undefined;

    do {
      const result = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefixKey,
          ContinuationToken: continuationToken,
        }),
      );

      const objects = result.Contents ?? [];

      if (objects.length > 0) {
        await this.s3Client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: objects
                .filter((object) => object.Key)
                .map((object) => ({
                  Key: object.Key,
                })),
            },
          }),
        );
      }

      continuationToken = result.NextContinuationToken;
    } while (continuationToken);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async exists(key: string) {}
}
