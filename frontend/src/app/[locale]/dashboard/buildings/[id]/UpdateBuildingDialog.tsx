import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
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
import { useBuilding, useUpdateBuilding } from '@/hooks/api';

import {
  BuildingFormFields,
  BuildingFormFieldsType,
  buildingSchema,
  UpdateBuildingFieldsType,
} from '../BuildingFormFields';

type UpdateBuildingDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  buildingId: string;
};

export default function UpdateBuildingDialog({
  open,
  setOpen,
  buildingId,
}: UpdateBuildingDialogProps) {
  // Radix Dialog blocks pointer events outside its content, so Base UI Combobox must portal into it
  const dialogRef = useRef<HTMLDivElement>(null);
  const updateBuildingMutate = useUpdateBuilding();

  const { data: building } = useBuilding(buildingId);
  const form = useForm<BuildingFormFieldsType>({
    resolver: zodResolver(buildingSchema),
    // Use `values` instead of `defaultValues` to sync form with updated data
    values: building
      ? {
          name: building.name || '',
          address: building.address || '',
          description: building.description || '',
          landlordId: building.landlordId || '',
          electricityRate: Number(building.electricityRate),
          waterRate: Number(building.waterRate),
          gasRate: Number(building.gasRate),
          billingDate: building.billingDate ?? Number(building.billingDate),
          managementFee: Number(building.managementFee),
          cleaningFeePerPerson: Number(building.cleaningFeePerPerson),
          lightingFee: Number(building.lightingFee),
        }
      : undefined,
  });

  const handleEditBuilding = (data: UpdateBuildingFieldsType) => {
    updateBuildingMutate.mutate(
      { id: buildingId, data },
      {
        onSuccess: () => {
          toast.success('Tòa nhà đã được cập nhật thành công');
          setOpen(false);
        },
      },
    );
  };

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
        <div>
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <Building2 className="size-5" />
          </div>
          <h2 className="text-xl font-bold">Chỉnh sửa thông tin tòa nhà</h2>
        </div>
        <form
          id="edit-building-form"
          onSubmit={form.handleSubmit(handleEditBuilding)}
        >
          <BuildingFormFields form={form} dialogRef={dialogRef} />

          <div className="mt-6 flex justify-end gap-3 border-t pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Hủy
              </Button>
            </DialogClose>
            <Button>
              {updateBuildingMutate.isPending ? <Spinner /> : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
