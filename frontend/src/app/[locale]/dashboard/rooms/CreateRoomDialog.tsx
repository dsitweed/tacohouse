'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, DoorOpen } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import ProgressFileUpload from '@/components/ProgressFileUpload';
import {
  Button,
  Calendar,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  CurrencyInput,
  Dialog,
  DialogClose,
  DialogContent,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Textarea,
} from '@/components/ui';
import { Building, RoomStatus, RoomType } from '@/generated/model';
import { useBuildings, useCreateRoom } from '@/hooks/api';
import { ROOM_STATUS_MAP, ROOM_TYPES_MAPS, RoomTypeMapsType } from '@/types';
import { toApiDateString } from '@/utils';

import { buildingSchema } from '../buildings/BuildingFormFields';

type CreateRoomDialogType = {
  open: boolean;
  setOpen: (value: boolean) => void;
  form?: UseFormReturn<RoomFormFieldsType>;
};

export const roomSchema = z.object({
  buildingId: z.string().min(1, 'Vui lòng chọn tòa nhà'),
  number: z.string().min(1, 'Vui lòng nhập số phòng'),
  area: z.number().min(1, 'Vui lòng nhập diện tích'),
  monthlyRent: z.number().min(1, 'Vui lòng nhập giá thuê'),
  deposit: z.number().min(0, 'Tiền cọc lớn hơn hoặc bằng 0'),
  maxTenants: z
    .number()
    .min(1, 'Số lượng người tối đa lớn hơn hoặc bằng 1')
    .max(5, 'Số lượng người tối đa nhỏ hơn hoặc bằng 5'),
  roomType: z.enum(RoomType),
  description: z.string().optional(),
  images: z.array(z.instanceof(File)),
  status: z.enum(RoomStatus),
  availableFrom: z.date().optional(),
});

export type RoomFormFieldsType = z.infer<typeof roomSchema>;
export const updateRoomSchema = buildingSchema.partial();
export type UpdateRoomFieldsType = z.infer<typeof updateRoomSchema>;

export default function CreateRoomDialog({
  open,
  setOpen,
}: CreateRoomDialogType) {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { data: buildingsData } = useBuildings();

  const buildings = buildingsData?.data ?? [];

  const createRoomMutation = useCreateRoom();

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

  const handleCreateRoom = (data: RoomFormFieldsType) => {
    const { images, ...rest } = data;
    const createRoomDto = {
      ...rest,
      availableFrom: toApiDateString(rest.availableFrom),
    };

    createRoomMutation.mutate(createRoomDto, {
      onSuccess: () => {
        toast.success('Tạo phòng thành công', {
          position: 'top-center',
        });
        form.reset();
        setOpen(false);
      },
    });
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
          <FieldGroup>
            <Controller
              name="buildingId"
              control={form.control}
              rules={{
                required: 'Vui lòng chọn tòa nhà',
              }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="buildingId">
                    Tòa nhà
                    <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Combobox
                    items={buildings}
                    value={
                      buildings.find((item) => item.id === field.value) ?? null
                    }
                    onValueChange={(item) => field.onChange(item?.id ?? '')}
                    itemToStringLabel={(item) => item.name}
                  >
                    <ComboboxInput
                      aria-invalid={fieldState.invalid}
                      placeholder="Chọn tòa nhà"
                      showClear
                    />
                    <ComboboxContent container={dialogRef}>
                      <ComboboxEmpty>Không tìm thấy tòa nhà</ComboboxEmpty>
                      <ComboboxList>
                        {(item: Building) => (
                          <ComboboxItem key={item.id} value={item}>
                            {item.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="number"
                control={form.control}
                rules={{
                  required: 'Vui lòng nhập số phòng',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="number">
                      Số phòng
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="number"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ví dụ: 101, 102, 201..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="area"
                control={form.control}
                rules={{
                  required: 'Vui lòng nhập diện tích',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="area">
                      Diện tích m²
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="area"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập diện tích"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="monthlyRent"
                control={form.control}
                rules={{
                  required: 'Vui lòng nhập giá thuê',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="monthlyRent">
                      Giá thuê tháng VND
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="monthlyRent"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập giá thuê"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="deposit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="deposit">Tiền đặt cọc VND</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="deposit"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập tiền đặt cọc"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="maxTenants"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="maxTenants">
                      Người thuê tối đa
                    </FieldLabel>
                    <Input
                      {...field}
                      id="maxTenants"
                      type="number"
                      min={1}
                      max={5}
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập số lượng tối đa người thuê"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="roomType"
                control={form.control}
                rules={{
                  required: 'Vui lòng chọn loại phòng',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="roomType">Loại phòng</FieldLabel>
                    <Combobox
                      items={Object.values(ROOM_TYPES_MAPS)}
                      value={
                        Object.values(ROOM_TYPES_MAPS).find(
                          ({ value }) => value === field.value,
                        ) ?? null
                      }
                      onValueChange={(item) =>
                        field.onChange(item?.value ?? '')
                      }
                      itemToStringLabel={(item) => item.label}
                    >
                      <ComboboxInput placeholder="Chọn loại phòng" showClear />
                      <ComboboxContent container={dialogRef}>
                        <ComboboxEmpty>Không tìm thấy</ComboboxEmpty>
                        <ComboboxList>
                          {(item: RoomTypeMapsType) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="status">Trạng thái</FieldLabel>
                    {/* FIXME: use  Combobox */}
                    <Combobox
                      items={Object.values(ROOM_STATUS_MAP)}
                      value={
                        Object.values(ROOM_STATUS_MAP).find(
                          ({ value }) => value === field.value,
                        ) ?? null
                      }
                      onValueChange={(item) =>
                        field.onChange(item?.value ?? '')
                      }
                      itemToStringLabel={(item) => item.label}
                    >
                      <ComboboxInput placeholder="Chọn trạng thái" showClear />
                      <ComboboxContent container={dialogRef}>
                        <ComboboxEmpty>Không tìm thấy</ComboboxEmpty>
                        <ComboboxList>
                          {(item: RoomTypeMapsType) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="availableFrom"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="availableFrom">
                      Ngày có thể thuê
                    </FieldLabel>
                    <Popover
                      open={popoverIsOpen}
                      onOpenChange={setPopoverIsOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="dateOfBirth"
                          type="button"
                          variant="outline"
                          className="w-full justify-start bg-white font-normal"
                        >
                          <CalendarIcon />
                          {field.value ? (
                            field.value.toLocaleDateString()
                          ) : (
                            <span className="text-gray-500">
                              {'dd/mm/yyyy'}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          defaultMonth={field.value}
                          captionLayout="dropdown"
                          disabled={[{ before: new Date() }]}
                          onSelect={(date) => {
                            field.onChange(date);
                            setPopoverIsOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Mô tả</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nhập mô tả"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="images"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="images">Hình ảnh</FieldLabel>
                  {/* FIXME: use upload component */}
                  <ProgressFileUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

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
