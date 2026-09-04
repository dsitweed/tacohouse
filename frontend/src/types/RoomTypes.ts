import * as z from 'zod';

import { BadgeVariantType } from '@/components/ui';
import { RoomStatus } from '@/generated/model';

import { RoomType } from './EnumsTypes';

export type RoomTypeMapsType = (typeof ROOM_TYPES_MAPS)[RoomType];
export const ROOM_TYPES_MAPS: Record<
  RoomType,
  { value: RoomType; label: string }
> = {
  FULL_RIGHTS: {
    value: RoomType.FULL_RIGHTS,
    label: 'Phòng nguyên căn',
  },
  PARTIAL_RIGHTS: {
    value: RoomType.PARTIAL_RIGHTS,
    label: 'Phòng khép kín',
  },
};

export type RoomStatusMapsType = (typeof ROOM_STATUS_MAP)[RoomStatus];
export const ROOM_STATUS_MAP: Record<
  RoomStatus,
  {
    value: RoomStatus;
    label: string;
    variant: BadgeVariantType;
  }
> = {
  PENDING_CHECKOUT: {
    value: RoomStatus.PENDING_CHECKOUT,
    label: 'Chờ xử lý',
    variant: 'pending',
  },
  AVAILABLE: {
    value: RoomStatus.AVAILABLE,
    label: 'Đang trống',
    variant: 'successLight',
  },
  OCCUPIED: {
    value: RoomStatus.OCCUPIED,
    label: 'Đang thuê',
    variant: 'secondary',
  },
  MAINTENANCE: {
    value: RoomStatus.MAINTENANCE,
    label: 'Bảo trì',
    variant: 'destructive',
  },
};

export const existingImageItemSchema = z.object({
  status: z.literal('existing'),
  id: z.string(), // uuid or key
  url: z.string(), // URL for review
  key: z.string(), // key in R2 (existing image)
  file: z.instanceof(File).optional(), // only for new images (When upload images, we will use this file to upload to R2)
});

export const newImageItemSchema = z.object({
  status: z.literal('new'),
  id: z.string(), // uuid or key
  url: z.string(), // URL for review
  file: z.instanceof(File), // only for new images (When upload images, we will use this file to upload to R2)
  key: z.string().optional(), // key in R2 (existing image)
});

export const imageItemSchema = z.object({
  existingImages: z.array(existingImageItemSchema),
  newImages: z.array(newImageItemSchema),
});

export type ExistingImageItem = z.infer<typeof existingImageItemSchema>;
export type NewImageItem = z.infer<typeof newImageItemSchema>;
export type ImageFormState = z.infer<typeof imageItemSchema>;
