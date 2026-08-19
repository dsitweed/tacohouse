const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MB = 1024 * 1024;

export enum UploadPurpose {
  BUILDING_IMAGE = 'BUILDING_IMAGE',
  ROOM_IMAGE = 'ROOM_IMAGE',

  USER_AVATAR = 'USER_AVATAR',
  USER_ID_CARD_FRONT_PHOTO = 'USER_ID_CARD_FRONT_PHOTO',
  USER_ID_CARD_BACK_PHOTO = 'USER_ID_CARD_BACK_PHOTO',
  USER_PORTRAIT_PHOTO = 'USER_PORTRAIT_PHOTO',

  PAYMENT_RECEIPT_IMAGE = 'PAYMENT_RECEIPT_IMAGE',
}

export type UploadPurposeConfig = {
  folderPath: string;
  visibility: 'public' | 'private';
  maxFileSize: number;
  allowedContentTypes: string[];
};

export const UPLOAD_CONFIG: Record<UploadPurpose, UploadPurposeConfig> = {
  [UploadPurpose.BUILDING_IMAGE]: {
    folderPath: 'uploads/images/buildings',
    visibility: 'public',
    maxFileSize: 5 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
  [UploadPurpose.ROOM_IMAGE]: {
    folderPath: 'uploads/images/rooms',
    visibility: 'public',
    maxFileSize: 5 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
  [UploadPurpose.USER_AVATAR]: {
    folderPath: 'uploads/images/users',
    visibility: 'public',
    maxFileSize: 2 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
  [UploadPurpose.USER_ID_CARD_FRONT_PHOTO]: {
    folderPath: 'uploads/images/users',
    visibility: 'private',
    maxFileSize: 5 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
  [UploadPurpose.USER_ID_CARD_BACK_PHOTO]: {
    folderPath: 'uploads/images/users',
    visibility: 'private',
    maxFileSize: 5 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
  [UploadPurpose.USER_PORTRAIT_PHOTO]: {
    folderPath: 'uploads/images/users',
    visibility: 'private',
    maxFileSize: 5 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
  [UploadPurpose.PAYMENT_RECEIPT_IMAGE]: {
    folderPath: 'uploads/images/payments',
    visibility: 'private',
    maxFileSize: 5 * MB,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
  },
};
