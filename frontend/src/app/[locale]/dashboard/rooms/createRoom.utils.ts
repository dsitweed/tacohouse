import { PresignedUrl } from '@/generated/model';

/**
 * Upload images to presigned URLs
 * Maps files by fileName to ensure correct URL matching
 * @throws Error if upload fails or presigned URL not found
 */
export const uploadImages = async (
  images: File[],
  presignedUrls: PresignedUrl[],
): Promise<Response[]> => {
  const urlsByFileName = new Map(
    presignedUrls.map((url) => [url.fileName, url.uploadUrl]),
  );

  const uploadRequests = images.map((image) => {
    const presignedUrl = urlsByFileName.get(image.name);
    if (!presignedUrl) {
      throw new Error(`No presigned URL found for file: ${image.name}`);
    }

    return fetch(presignedUrl, {
      method: 'PUT',
      body: image,
      headers: {
        'Content-Type': image.type,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Upload failed for ${image.name}: ${response.status} ${response.statusText}`,
        );
      }
      return response;
    });
  });

  return Promise.all(uploadRequests);
};
