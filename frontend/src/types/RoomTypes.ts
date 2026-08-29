import { VariantProps } from 'class-variance-authority';
import * as z from 'zod';

import { badgeVariants } from '@/components/ui';
import { RoomStatus } from '@/generated/model';

import type { Building } from './BuildingTypes';
import type { EquipmentCondition } from './EnumsTypes';
import { RoomType } from './EnumsTypes';

export interface Room {
  id: string;
  number: string;
  buildingId: string;
  building?: Building;

  area: number;
  monthlyRent: number;
  deposit: number;
  maxTenants: number;
  roomType: RoomType;
  description?: string | null;
  images: string[];
  status: RoomStatus;
  availableFrom?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface RoomEquipment {
  id: string;
  roomId: string;
  room?: Room;
  name: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  installedDate?: string | null;
  warrantyExpiryDate?: string | null;
  condition: EquipmentCondition;
  createdAt: string;
  updatedAt: string;
}

export type RoomTypeMapsType = (typeof ROOM_TYPES_MAPS)[RoomType];
export const ROOM_TYPES_MAPS: Record<
  RoomType,
  { value: RoomType; label: string }
> = {
  [RoomType.FULL_RIGHTS]: {
    value: RoomType.FULL_RIGHTS,
    label: 'Phòng nguyên căn',
  },
  [RoomType.PARTIAL_RIGHTS]: {
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
    variant: VariantProps<typeof badgeVariants>['variant'];
  }
> = {
  [RoomStatus.PENDING_CHECKOUT]: {
    value: RoomStatus.PENDING_CHECKOUT,
    label: 'Chờ xử lý',
    variant: 'pending',
  },
  [RoomStatus.AVAILABLE]: {
    value: RoomStatus.AVAILABLE,
    label: 'Đang trống',
    variant: 'successLight',
  },
  [RoomStatus.OCCUPIED]: {
    value: RoomStatus.OCCUPIED,
    label: 'Đang thuê',
    variant: 'secondary',
  },
  [RoomStatus.MAINTENANCE]: {
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
