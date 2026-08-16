'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import {
  Button,
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
  Textarea,
} from '@/components/ui';
import { UserRole } from '@/generated/model';
import { useBuildings, useCreateBuilding } from '@/hooks/api';
import { useAuthStore } from '@/stores/authStore';

type CreateBuildingDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const newBuildingSchema = z.object({
  name: z.string().min(1, 'Tên tòa nhà không được để trống'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  billingDate: z.number().optional(),
  landlordId: z.string().min(1, 'Vui lòng chọn chủ sở hữu'),
  electricityRate: z.number().min(0, 'Đơn giá điện phải lớn hơn hoặc bằng 0'),
  waterRate: z.number().min(0, 'Đơn giá nước phải lớn hơn hoặc bằng 0'),
  gasRate: z.number().min(0, 'Đơn giá gas phải lớn hơn hoặc bằng 0'),
  managementFee: z
    .number()
    .min(0, 'Phí quản lý phải lớn hơn hoặc bằng 0')
    .optional(),
  cleaningFeePerPerson: z
    .number()
    .min(0, 'Phí vệ sinh phải lớn hơn hoặc bằng 0')
    .optional(),
  lightingFee: z
    .number()
    .min(0, 'Phí chiếu sáng phải lớn hơn hoặc bằng 0')
    .optional(),
});

export default function CreateBuildingDialog({
  open,
  setOpen,
}: CreateBuildingDialogProps) {
  const user = useAuthStore((state) => state.user);
  // Radix Dialog blocks pointer events outside its content, so Base UI Combobox must portal into it
  const dialogRef = useRef<HTMLDivElement>(null);
  const createBuildingMutation = useCreateBuilding();
  const { data: buildingsData } = useBuildings({
    page: 1,
    limit: 100,
  });
  const buildings = buildingsData?.data ?? [];

  const form = useForm<z.infer<typeof newBuildingSchema>>({
    resolver: zodResolver(newBuildingSchema),
    defaultValues: {
      name: '',
      address: '',
      description: '',
      billingDate: undefined,
      landlordId: '',
      electricityRate: 0,
      waterRate: 0,
      gasRate: 0,
      managementFee: 0,
      cleaningFeePerPerson: 0,
      lightingFee: 0,
    },
  });

  const landlordsData = (() => {
    const landlordMap = new Map<string, { value: string; label: string }>();

    for (const building of buildings) {
      landlordMap.set(building.landlordId, {
        value: building.landlordId,
        label:
          building.landlord?.profile?.firstName ??
          building.landlord?.email ??
          building.landlordId,
      });
    }

    // FIXME: have bug when user is LANDLORD but can see other landlords' buildings
    // FIXME 1: Create GET /users?role=LANDLORD API to get all landlords (Admin only)
    // FIXME 2: If user is LANDLORD, hidden landlordId field and auto set landlordId
    // FIXME 3: Label just have firstName (need fullName)
    if (user?.role === UserRole.LANDLORD) {
      landlordMap.set(user.id, {
        value: user.id,
        label: 'Tôi (Chủ sở hữu)',
      });
    }

    return [...landlordMap.values()];
  })();

  const handleCreateBuilding = (data: z.infer<typeof newBuildingSchema>) => {
    // FIXME: Create and reload buildings list
    // FIXME: not return correct data, after create new building, the list of buildings is not updated
    createBuildingMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Tòa nhà đã được tạo thành công');
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-2xl"
        ref={dialogRef}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <Building2 className="size-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Thêm tòa nhà mới</h2>
        </div>
        <form
          id="create-building-form"
          onSubmit={form.handleSubmit(handleCreateBuilding)}
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                rules={{
                  required: 'Tên tòa nhà không được để trống',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">
                      Tên tòa nhà
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ví dụ: Taco House Landmark"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="landlordId"
                control={form.control}
                rules={{
                  required: 'Vui lòng chọn chủ sở hữu',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="landlordId">
                      Chủ sở hữu
                      <span className="text-red-500">*</span>
                    </FieldLabel>

                    <Combobox
                      items={landlordsData}
                      value={
                        landlordsData.find(
                          (item) => item.value === field.value,
                        ) ?? null
                      }
                      onValueChange={(item) =>
                        field.onChange(item?.value ?? '')
                      }
                    >
                      <ComboboxInput placeholder="Chọn chủ sở hữu" showClear />
                      <ComboboxContent container={dialogRef}>
                        <ComboboxEmpty>Không tìm thấy chủ sở hữu</ComboboxEmpty>
                        <ComboboxList>
                          {(item: (typeof landlordsData)[number]) => (
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
            </div>

            <Controller
              name="address"
              control={form.control}
              rules={{
                required: 'Địa chỉ tòa nhà không được để trống',
              }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address">
                    Địa chỉ tòa nhà
                    <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="address"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP. HCM"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              rules={{
                required: 'Mô tả tòa nhà không được để trống',
              }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">
                    Mô tả tòa nhà
                    <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ví dụ: Tòa nhà cao cấp với nhiều tiện ích. Phù hợp cho cả văn phòng và căn hộ."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Controller
                name="electricityRate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="electricityRate">
                      Giá điện (VNĐ/kWh)
                    </FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="electricityRate"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập đơn giá điện"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* TODO: > 1000 VND for waterRate and other rates */}
              <Controller
                name="waterRate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="waterRate">
                      Giá nước (VNĐ/m³)
                    </FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="waterRate"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập đơn giá nước"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="gasRate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gasRate">Giá gas (VNĐ/m³)</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="gasRate"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập đơn giá gas"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="managementFee"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="managementFee">Phí quản lý</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="managementFee"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập phí quản lý"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="cleaningFeePerPerson"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cleaningFeePerPerson">
                      Đơn giá dọn dẹp
                    </FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="cleaningFeePerPerson"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập đơn giá dọn dẹp"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="lightingFee"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lightingFee">
                      Đơn giá điện chiếu sáng
                    </FieldLabel>
                    <CurrencyInput
                      {...field}
                      id="lightingFee"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập đơn giá điện chiếu sáng"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className="mt-6 flex justify-end gap-3 border-t pt-2">
            <DialogClose>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={createBuildingMutation.isPending}
            >
              {createBuildingMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Tạo tòa nhà'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
