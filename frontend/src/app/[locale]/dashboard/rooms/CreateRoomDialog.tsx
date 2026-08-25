'use client';

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
import { RoomStatus, RoomType, UploadPurpose } from '@/generated/model';
import {
  useCreateRoom,
  useDeleteRoom,
  usePresignedUrls,
  useUpdateRoom,
} from '@/hooks/api';
import { toApiDateString } from '@/utils';

import { uploadImages } from './createRoom.utils';
import RoomFormFields, {
  RoomFormFieldsType,
  roomSchema,
} from './RoomFormFields';

type CreateRoomDialogType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function CreateRoomDialog({
  open,
  setOpen,
}: CreateRoomDialogType) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const createRoomMutation = useCreateRoom();
  const createPresignedUrlMutation = usePresignedUrls();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  const form = useForm<RoomFormFieldsType>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      buildingId: '',
      number: '',
      area: 0,
      monthlyRent: 0,
      deposit: 0,
      maxTenants: 1,
      roomType: RoomType.FULL_RIGHTS,
      description: '',
      images: [],
      status: RoomStatus.AVAILABLE,
      availableFrom: undefined,
    },
  });
  /**
   * 1. Create room
   * 2. If not have images -> return handle success
   * 2. if have images -> Get presigned url
   * 3. Upload images to storage
   * 4. Update room with key (after upload images successful)
   * 5. Close dialog, toast success
   * 6 Error handling, delete room, delete images in storage if failed
   */
  const handleCreateRoom = async (data: RoomFormFieldsType) => {
    const { images, ...rest } = data;
    let roomId: string | undefined;

    try {
      const newRoom = await createRoomMutation.mutateAsync({
        ...rest,
        availableFrom: toApiDateString(rest.availableFrom),
      });

      roomId = newRoom.id;

      if (images.length === 0) {
        handleCreateRoomSuccess();
        return;
      }

      const presignedUrls = await createPresignedUrlMutation.mutateAsync({
        files: images.map((image) => ({
          fileName: image.name,
          contentType: image.type,
        })),
        resourceId: newRoom.id,
        purpose: UploadPurpose.ROOM_IMAGE,
      });

      await uploadImages(images, presignedUrls);

      await updateRoomMutation.mutateAsync({
        id: newRoom.id,
        data: { images: presignedUrls.map((url) => url.key) },
      });

      handleCreateRoomSuccess();
    } catch (error) {
      console.error(error);

      if (roomId) {
        try {
          await deleteRoomMutation.mutateAsync(roomId);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      handleCreateRoomError();
    }
  };

  const handleCreateRoomError = () => {
    toast.error('Tạo phòng thất bại', {
      position: 'top-center',
    });
  };

  const handleCreateRoomSuccess = () => {
    toast.error('Tạo phòng thành công', {
      position: 'top-center',
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <h2 className="text-xl font-bold">Thêm phòng mới</h2>
        </div>

        <form
          id="create-room-form"
          onSubmit={form.handleSubmit(handleCreateRoom)}
        >
          <RoomFormFields form={form} dialogRef={dialogRef} />
          <div className="mt-6 flex justify-end gap-3 border-t pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createRoomMutation.isPending}>
              {createRoomMutation.isPending ? <Spinner /> : 'Tạo phòng'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
