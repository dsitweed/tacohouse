import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreatePresignedUrlsDto, PresignedUrl } from '@/generated/model';
import { apiClient, queryKeys } from '@/libs';

export const uploadsApi = {
  presignedUrls: async (data: CreatePresignedUrlsDto) => {
    const response = await apiClient.post<PresignedUrl[]>(
      '/uploads/presigned-urls',
      data,
    );
    return response.data;
  },
};

export const usePresignedUrls = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadsApi.presignedUrls,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploads.presignedUrls(),
      });
    },
  });
};
