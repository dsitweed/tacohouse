import { PresignedUrl } from '@/generated/model';
import { NewImageItem } from '@/types';

/**
 * Upload images to presigned URLs
 * Maps files by fileName to ensure correct URL matching
 * @throws Error if upload fails or presigned URL not found
 */
export const uploadImages = async (
  imageItems: NewImageItem[],
  presignedUrls: PresignedUrl[],
): Promise<Response[]> => {
  const urlsByFileId = new Map(
    presignedUrls.map((url) => [url.fileId, url.uploadUrl]),
  );

  const uploadRequests = imageItems.map(async (item) => {
    const presignedUrl = urlsByFileId.get(item.id);
    if (!presignedUrl) {
      throw new Error(`No presigned URL found for file: ${item.file?.name}`);
    }

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: item.file,
      headers: {
        'Content-Type': item.file.type,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed for ${item.file.name}: ${response.status} ${response.statusText}`,
      );
    }
    return response;
  });

  return Promise.all(uploadRequests);
};
