'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Building2,
  Calendar,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  BarShapeProps,
  CartesianGrid,
  Rectangle,
  XAxis,
} from 'recharts';
import { toast } from 'sonner';
import * as z from 'zod';

import {
  ButtonGroup,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  CurrencyInput,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Separator,
  SkeletonPage,
  Textarea,
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBuildings, useCreateBuilding } from '@/hooks/api/useBuildings';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { formatCurrency, typedEntries } from '@/utils';

// Revenue Forecast mock chart data
const REVENUE_FORECAST = [
  { month: 'Tháng 7', revenue: 68000, heightPct: 65 },
  { month: 'Tháng 8', revenue: 72000, heightPct: 72 },
  { month: 'Tháng 9', revenue: 71000, heightPct: 70 },
  { month: 'Tháng 10', revenue: 84000, heightPct: 92 }, // Best revenue month
  { month: 'Tháng 11', revenue: 79000, heightPct: 82 },
  { month: 'Tháng 12', revenue: 82000, heightPct: 88 },
];

const BuildingTab = {
  all: 'Tất cả',
  residential: 'Nhà ở',
  commercial: 'Thương mại',
};
type BuildingTabType = keyof typeof BuildingTab;

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

export default function BuildingsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const createBuildingMutation = useCreateBuilding();
  const [activeTab, setActiveTab] = useState<BuildingTabType>('all');
  // TODO: use global state instead
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Radix Dialog blocks pointer events outside its content, so Base UI Combobox must portal into it
  const dialogRef = useRef<HTMLDivElement>(null);
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

  const { data: buildingsData, isLoading } = useBuildings({
    page: 1,
    limit: 20,
    search,
  });
  const buildings = useMemo(() => buildingsData?.data ?? [], [buildingsData]);

  const canCreate =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;
  const landlordsData = useMemo(() => {
    const landlordMap = new Map<string, { value: string; label: string }>();

    for (const building of buildings) {
      const landlordInfo =
        building.landlord?.profile?.firstName ||
        building.landlord?.email ||
        building.landlordId;
      landlordMap.set(building.landlordId, {
        value: building.landlordId,
        label: landlordInfo,
      });
      if (user?.role === UserRole.LANDLORD) {
        landlordMap.set(user.id, {
          value: user.id,
          label: 'Tôi (Chủ sở hữu)',
        });
      }
    }

    return [...landlordMap.values()];
  }, [buildings, user]);
  const displayBuildings = useMemo(() => {
    const imagesList = [
      '/images/buildings/sunset-heights.png',
      '/images/buildings/azure-bay.png',
      '/images/buildings/oakwood-lofts.png',
      '/images/buildings/emerald-garden.png',
      'https://images.pexels.com/photos/9864028/pexels-photo-9864028.jpeg',
    ];

    return buildings.map((building, index) => ({
      id: building.id,
      name: building.name,
      address: building.address,
      roomsCount: building._count.rooms || building.rooms?.length || 0,
      occupancy: '80%',
      monthlyRevenue: 10000000,
      status: 'ACTIVE',
      image: imagesList[index % imagesList.length],
      type: index % 2 === 0 ? 'residential' : 'commercial',
      isReal: true,
    }));
  }, [buildings]);

  const filteredBuildings = useMemo(() => {
    return displayBuildings.filter(
      (item) => activeTab === 'all' || item.type === activeTab,
    );
  }, [activeTab, displayBuildings]);

  const handleCreateBuilding = (data: z.infer<typeof newBuildingSchema>) => {
    console.log({
      data,
    });
    createBuildingMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Tòa nhà đã được tạo thành công');
        setIsAddModalOpen(false);
        form.reset();
      },
    });
  };

  const maxRevenueMonth = REVENUE_FORECAST.reduce((max, item) =>
    max.revenue > item.revenue ? max : item,
  );

  const revenueChartConfig = {
    revenue: {
      label: 'Doanh thu',
      color: '#1e40af',
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      {/* Search & Top Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Field className="max-w-md flex-1">
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4 text-gray-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm kiếm theo tên hoặc địa chỉ tòa nhà..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Field>

        {canCreate && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-700 hover:bg-blue-800"
          >
            <Plus className="size-4" />
            Thêm tòa nhà
          </Button>
        )}
      </div>
      {/* Header & Filter Tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tòa nhà</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý thông tin các tòa nhà và đơn giá dịch vụ
          </p>
        </div>

        <div>
          <ButtonGroup>
            {typedEntries(BuildingTab).map(([tab, tabName]) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab)}
              >
                {tabName}
              </Button>
            ))}
            <Button variant="outline" disabled>
              <SlidersHorizontal className="size-3.5" />
              Bộ lọc
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Buildings Bento Grid */}
      {isLoading ? (
        <SkeletonPage className="max-w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBuildings.map((building) => (
            <Card key={building.id} className="p-0">
              <CardContent className="group h-full p-0">
                {/* Card Image Banner */}
                {/* TODO: use Aspect Ratio of Shadcn */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={building.image}
                    alt={building.name}
                    fill
                    // TODO: fix size dependent on screen size
                    sizes="50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Active Status Badge */}
                  <Badge
                    variant={
                      building.status === 'ACTIVE' ? 'success' : 'destructive'
                    }
                    className="absolute top-3 left-3 rounded-md text-[10px] font-bold"
                  >
                    {building.status}
                  </Badge>
                  {/* Overlay Action */}
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-3 right-3 rounded-full"
                    title="Xem thêm"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </div>

                {/* Card Main Info */}
                <div className="flex flex-1 flex-col gap-3 p-5 pt-0">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {building.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-gray-500">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{building.address}</span>
                    </div>

                    {/* Metric Boxes */}
                    <div className="mt-4 flex gap-3">
                      <div className="flex-1 rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-semibold tracking-wide text-gray-500">
                          Số phòng
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight">
                          {building.roomsCount}
                        </p>
                      </div>
                      <div className="flex-1 rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-semibold tracking-wide text-gray-500">
                          Lấp đầy
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-800">
                          {building.occupancy}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Month Revenue */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-gray-500">
                        Doanh thu hàng tháng
                      </p>
                      <p className="text-xl font-semibold text-blue-700">
                        {formatCurrency(building.monthlyRevenue)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full"
                    >
                      <Link href={`/dashboard/buildings/${building.id}`}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add new building */}
          {canCreate && (
            <Card className="cursor-pointer border border-dashed hover:border-blue-500 hover:bg-blue-50/40">
              <CardContent className="min-h-95">
                <Dialog>
                  <DialogTrigger className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-blue-200 text-blue-800">
                      <Plus className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Thêm tòa nhà mới
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Mở rộng danh mục đầu tư của bạn
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl" ref={dialogRef}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                        <Building2 className="size-5" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Thêm tòa nhà mới
                      </h2>
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
                                  <ComboboxInput
                                    placeholder="Chọn chủ sở hữu"
                                    showClear
                                  />
                                  <ComboboxContent container={dialogRef}>
                                    <ComboboxEmpty>
                                      Không tìm thấy chủ sở hữu
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                      {(
                                        item: (typeof landlordsData)[number],
                                      ) => (
                                        <ComboboxItem
                                          key={item.value}
                                          value={item}
                                        >
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                <FieldLabel htmlFor="gasRate">
                                  Giá gas (VNĐ/m³)
                                </FieldLabel>
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
                                <FieldLabel htmlFor="managementFee">
                                  Phí quản lý
                                </FieldLabel>
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
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Portfolio Analytics Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Forecast Bar Chart Widget */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Dự báo doanh thu
            </h3>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
              <Calendar className="size-3.5 text-blue-800" />
              <span>6 tháng tới</span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-52">
              <BarChart accessibilityLayer data={REVENUE_FORECAST}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(_, payload) =>
                        payload[0]?.payload?.month ?? ''
                      }
                      formatter={(value) => [
                        formatCurrency(value as number),
                        '',
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  strokeWidth={2}
                  radius={8}
                  shape={({ index, ...props }: BarShapeProps) => {
                    // FIXME: render qua nhieu lan
                    // console.log({ index, props });

                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                        fill={
                          props.payload.month === maxRevenueMonth.month
                            ? '#1e40af'
                            : '#93C5FD'
                        }
                      />
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Portfolio Insights Banner */}
        <Card className="bg-blue-800">
          <CardHeader className="gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <Sparkles className="size-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Phân tích hiệu suất
            </h3>
            <p className="text-sm leading-relaxed text-white/90">
              Tỷ lệ lấp đầy tổng thể của bạn <strong>cao hơn 4%</strong> so với
              mức trung bình của thị trường khu vực. Bạn có thể cân nhắc tăng
              giá tại <strong>thêm 2,5%</strong> vào tháng tới.
            </p>
          </CardHeader>
          <CardContent>
            <Button className="bg-white font-bold text-blue-800 hover:bg-blue-50">
              Xem kế hoạch tối ưu hóa
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
