import { zodResolver } from '@hookform/resolvers/zod';
import { DoorOpen } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Spinner,
} from '@/components/ui';
import {
  PresignedUrl,
  RoomStatus,
  RoomType,
  UploadPurpose,
} from '@/generated/model';
import {
  useDeleteObject,
  usePresignedUrls,
  useRoom,
  useUpdateRoom,
} from '@/hooks/api';
import { useDialogStore } from '@/stores/dialogStore';
import { toApiDateString } from '@/utils';

import { uploadImages } from '../createRoom.utils';
import RoomFormFields, {
  RoomFormFieldsType,
  roomSchema,
  UpdateRoomFieldsType,
} from '../RoomFormFields';

type UpdateRoomDialogType = {
  roomId: string;
};

export default function UpdateRoomDialog({ roomId }: UpdateRoomDialogType) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const { isOpen, isLoading, closeDialog, setLoading } = useDialogStore();
  const createPresignedUrlMutation = usePresignedUrls();
  const deleteObjectMutation = useDeleteObject();
  const updateRoomMutation = useUpdateRoom();
  const { data: room } = useRoom(roomId);

  const form = useForm<RoomFormFieldsType>({
    resolver: zodResolver(roomSchema),
    values: room
      ? {
          buildingId: room.buildingId || '',
          number: room.number || '',
          area: Number(room.area) || 0,
          monthlyRent: Number(room.monthlyRent) || 0,
          deposit: Number(room.deposit) || 0,
          maxTenants: Number(room.maxTenants) || 1,
          roomType: room.roomType || RoomType.FULL_RIGHTS,
          description: room.description || '',
          images: {
            newImages: [],
            existingImages: room.images.map((r2Key) => ({
              status: 'existing',
              id: r2Key,
              key: r2Key,
              url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN}/${r2Key}`,
            })),
          },
          status: room.status || RoomStatus.AVAILABLE,
          availableFrom: room.availableFrom
            ? new Date(room.availableFrom)
            : undefined,
        }
      : undefined,
  });

  const handleUpdateRoom = async (data: UpdateRoomFieldsType) => {
    const { images, ...rest } = data;
    let uploadedPresignedUrls: PresignedUrl[] = [];
    let imageKeysToDelete: string[] = [];

    setLoading(true);

    try {
      // Step 1: Update room basic info
      await updateRoomMutation.mutateAsync({
        id: roomId,
        data: {
          ...rest,
          availableFrom: toApiDateString(rest.availableFrom),
        },
      });

      // Step 2: Identify removed image by comparing current with original
      if (images && room?.images) {
        const currentExistingKeys = new Set(
          images.existingImages.map((image) => image.key),
        );

        imageKeysToDelete = room.images.filter(
          (image) => !currentExistingKeys.has(image),
        );
      }

      if (
        !images ||
        (images.newImages.length === 0 && imageKeysToDelete.length === 0)
      ) {
        handleUpdateRoomSuccess();
        return;
      }

      // Step 3: Handle new images upload
      if (images.newImages.length > 0) {
        uploadedPresignedUrls = await createPresignedUrlMutation.mutateAsync({
          files: images.newImages.map((item) => ({
            fileName: item.file.name,
            contentType: item.file.type,
            fileId: item.id,
          })),
          resourceId: roomId,
          purpose: UploadPurpose.ROOM_IMAGE,
        });

        await uploadImages(images.newImages, uploadedPresignedUrls);
      }

      // Step 4: Update images list (always update to sync removed images)
      await updateRoomMutation.mutateAsync({
        id: roomId,
        data: {
          images: [
            ...images.existingImages.map((item) => item.key),
            ...uploadedPresignedUrls.map((url) => url.key),
          ],
        },
      });

      // Step 5: Delete removed images from R2 after successful update
      if (imageKeysToDelete.length > 0) {
        await Promise.all(
          imageKeysToDelete.map((imageKey) =>
            deleteObjectMutation.mutateAsync({
              resourceId: roomId,
              key: imageKey,
              purpose: UploadPurpose.ROOM_IMAGE,
            }),
          ),
        );
      }

      handleUpdateRoomSuccess();
    } catch (error) {
      console.error('Error updating room:', error);

      // Delete newly uploaded images from R2 if the update fails
      if (uploadedPresignedUrls.length > 0) {
        await Promise.all(
          uploadedPresignedUrls.map((presignedUrl) =>
            deleteObjectMutation
              .mutateAsync({
                resourceId: roomId,
                key: presignedUrl.key,
                purpose: UploadPurpose.ROOM_IMAGE,
              })
              .catch((err) => {
                console.error(
                  `Failed to delete image ${presignedUrl.key}:`,
                  err,
                );
              }),
          ),
        );
      }

      handleUpdateRoomError();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomSuccess = () => {
    toast.success('Cập nhật phòng thành công', {
      position: 'top-center',
    });
    closeDialog();
    form.reset();
  };

  const handleUpdateRoomError = () => {
    toast.error('Cập nhật phòng thất bại', {
      position: 'top-center',
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          closeDialog();
          form.reset();
        }
      }}
    >
      <DialogContent
        ref={dialogRef}
        className="sm:max-w-2xl"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div className="flex items-center gap-3">
          <div className="text-primary flex size-10 items-center justify-center rounded-full bg-blue-100">
            <DoorOpen className="size-5" />
          </div>
          <h2 className="text-xl font-bold">
            Sửa thông tin phòng {room?.number}
          </h2>
        </div>

        <form
          id="edit-room-form"
          onSubmit={form.handleSubmit(handleUpdateRoom)}
        >
          <RoomFormFields form={form} dialogRef={dialogRef} />

          <div className="mt-6 flex justify-end gap-3 border-t pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
