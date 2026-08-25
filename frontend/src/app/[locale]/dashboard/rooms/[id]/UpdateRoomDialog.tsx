import { zodResolver } from '@hookform/resolvers/zod';
import { DoorOpen } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Spinner,
} from '@/components/ui';
import { RoomStatus, RoomType } from '@/generated/model';
import { useRoom, useUpdateRoom } from '@/hooks/api';

import RoomFormFields, {
  RoomFormFieldsType,
  roomSchema,
  UpdateRoomFieldsType,
} from '../RoomFormFields';

type UpdateRoomDialogType = {
  open: boolean;
  setOpen: (value: boolean) => void;
  roomId: string;
};

export default function UpdateRoomDialog({
  open,
  setOpen,
  roomId,
}: UpdateRoomDialogType) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

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
          images: [],
          status: room.status || RoomStatus.AVAILABLE,
          availableFrom: room.availableFrom
            ? new Date(room.availableFrom)
            : undefined,
        }
      : undefined,
  });

  const handleUpdateRoom = async (data: UpdateRoomFieldsType) => {};

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        form.reset();
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
              <Button variant="outline" type="button">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={updateRoomMutation.isPending}>
              {updateRoomMutation.isPending ? <Spinner /> : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
