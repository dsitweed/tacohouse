'use client';

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
import { useCreateBuilding } from '@/hooks/api';

import {
  BuildingFormFields,
  BuildingFormFieldsType,
  buildingSchema,
} from './BuildingFormFields';

type CreateBuildingDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function CreateBuildingDialog({
  open,
  setOpen,
}: CreateBuildingDialogProps) {
  // Radix Dialog blocks pointer events outside its content, so Base UI Combobox must portal into it
  const dialogRef = useRef<HTMLDivElement>(null);
  const createBuildingMutation = useCreateBuilding();

  const form = useForm<BuildingFormFieldsType>({
    resolver: zodResolver(buildingSchema),
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

  const handleCreateBuilding = (data: BuildingFormFieldsType) => {
    // FIXME: Create and reload buildings list
    // FIXME: not return correct data, after create new building, the list of buildings is not updated
    createBuildingMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Tòa nhà đã được tạo thành công', {
          position: 'top-center',
        });
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
          <BuildingFormFields form={form} dialogRef={dialogRef} />

          <div className="mt-6 flex justify-end gap-3 border-t pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={createBuildingMutation.isPending}
            >
              {createBuildingMutation.isPending ? <Spinner /> : 'Tạo tòa nhà'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
