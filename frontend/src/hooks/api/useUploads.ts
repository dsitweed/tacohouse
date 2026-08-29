import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  CreatePresignedUrlsDto,
  PresignedUrl,
  UploadsControllerDeleteObjectParams,
  UploadsControllerDeleteObjectsByPrefixParams,
} from '@/generated/model';
import { apiClient, queryKeys } from '@/libs';

export const uploadsApi = {
  presignedUrls: async (data: CreatePresignedUrlsDto) => {
    const response = await apiClient.post<PresignedUrl[]>(
      '/uploads/presigned-urls',
      data,
    );
    return response.data;
  },
  deleteObject: async (query: UploadsControllerDeleteObjectParams) => {
    return apiClient.delete('/uploads/object', {
      params: query,
    });
  },
  deleteObjectsByPrefix: async (
    query: UploadsControllerDeleteObjectsByPrefixParams,
  ) => {
    return apiClient.delete('/uploads/object', {
      params: query,
    });
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

export const useDeleteObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadsApi.deleteObject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploads.deleteObject(),
      });
    },
  });
};

export const useDeleteObjectsByPrefix = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadsApi.deleteObjectsByPrefix,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploads.deleteObjectsByPrefix(),
      });
    },
  });
};
