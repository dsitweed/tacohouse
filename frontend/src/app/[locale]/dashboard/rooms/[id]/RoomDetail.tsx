'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  CirclePlus,
  Droplets,
  Lock,
  Maximize2,
  Pencil,
  Phone,
  UtensilsCrossed,
  Wifi,
  Wind,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NoItemsEmptyState,
  Progress,
  Separator,
  SkeletonPage,
} from '@/components/ui';
import { Room } from '@/generated/model';
import { useRoom } from '@/hooks/api';
import { ROOM_STATUS_MAP } from '@/types';
import { formatCurrency, toDateOnlyString } from '@/utils';

import ElectricityBarChart from './ElectricityBarChart';
import WaterBarChart from './WaterBarChart';

type RoomDetailProps = {
  id: string;
  initialRoom: Room;
};

// FIXME: now equipments not have type -> need to add type and implement equipments in room detail
const EQUIPMENT_MAP = [
  { icon: Wind, label: 'Air Conditioning' },
  { icon: Wifi, label: 'High-speed WiFi' },
  { icon: Droplets, label: 'Private Bathroom' },
  { icon: UtensilsCrossed, label: 'Kitchenette' },
  { icon: Lock, label: 'Smart Lock' },
];
const displayImages = [
  'https://images.pexels.com/photos/6466281/pexels-photo-6466281.jpeg',
  'https://images.pexels.com/photos/27531873/pexels-photo-27531873.jpeg',
  'https://images.pexels.com/photos/35189672/pexels-photo-35189672.jpeg',
  'https://images.pexels.com/photos/18368842/pexels-photo-18368842.jpeg',
  // 'https://images.pexels.com/photos/37429730/pexels-photo-37429730.png',
];

const SelectedPeriodOptions = [
  {
    value: 6,
    label: 'Last 6 Months',
  },
  {
    value: 3,
    label: 'Last 3 Months',
  },
  {
    value: 1,
    label: 'Last Month',
  },
];

export default function RoomDetail({ id, initialRoom }: RoomDetailProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(
    SelectedPeriodOptions[0],
  );

  const { data: room, isLoading } = useRoom(id, {
    initialData: initialRoom,
  });

  if (isLoading || !room) {
    return <SkeletonPage />;
  }

  const currentRental = room.rentals?.at(0); // first rental is the current one

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/rooms">
                  Tất cả phòng
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/dashboard/buildings/${room.buildingId}`}
                >
                  {room.building?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{room.number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Room {room.number}
            </h1>
            <Badge variant={ROOM_STATUS_MAP[room.status].variant}>
              {ROOM_STATUS_MAP[room.status].label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Pencil className="size-3.5" />
            <span>Edit detail</span>
          </Button>
          <Button>
            <CirclePlus className="size-4" />
            <span>Create Notice</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Image Gallery */}
        <Card className="col-span-12 bg-transparent p-0 ring-0 lg:col-span-8">
          <CardContent className="p-0">
            {displayImages.length <= 0 ? (
              <NoItemsEmptyState />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displayImages.map((image, index) => (
                  <div
                    key={`room-image-${index}`}
                    className="relative h-40 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={image}
                      alt="room-image"
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform hover:scale-105"
                      placeholder="empty"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Contract */}
        <Card className="col-span-12 pt-0 lg:col-span-4">
          <CardHeader className="bg-blue-600 py-6 text-white">
            <h3 className="text-lg font-semibold">Current Contract</h3>
            {/* FIXME: Display current rental start date  */}
            <p className="text-xs text-blue-100">
              Active since {toDateOnlyString(new Date(room.updatedAt))}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={currentRental?.tenant?.profile?.avatar ?? ''}
                  />
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{`${currentRental?.tenant?.profile?.firstName} ${currentRental?.tenant?.profile?.lastName}`}</p>
                  <p className="text-muted-foreground text-xs">
                    {currentRental?.tenant?.profile?.occupation}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="default"
                size="icon-sm"
                className="rounded-full"
              >
                <a href={`tel:${currentRental?.tenant?.profile?.phone}`}>
                  <Phone className="size-4" />
                </a>
              </Button>
            </div>

            <div>
              <div className="flex justify-between">
                <div className="text-muted-foreground">Contracts end</div>
                <div className="font-semibold">
                  {currentRental?.endDate ?? 'Not have'}
                </div>
              </div>
              <Progress
                value={
                  !currentRental?.endDate
                    ? 100
                    : calculateRentalProgress(
                        currentRental.startDate,
                        currentRental.endDate,
                      )
                }
              />
              <p className="text-muted-foreground mt-1 text-end text-xs font-semibold tracking-wider">
                {currentRental?.endDate
                  ? `${formatDistanceToNow(new Date(currentRental?.endDate), {
                      locale: vi,
                    })} MONTHS REMAINING`
                  : 'On going'}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            {/* TODO: add view full contract action */}
            <Button variant="outline" className="w-full">
              View Full Contract
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          {/* Room Info Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-row items-center">
                <span className="rounded-full bg-blue-50 p-3">
                  <Maximize2 className="text-primary size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500">AREA</p>
                  <p className="text-lg font-semibold">{room.area} m²</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center">
                <span className="rounded-full bg-blue-50 p-3">
                  <Maximize2 className="text-primary size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    MONTHLY RENT
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(room.monthlyRent)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center">
                <span className="rounded-full bg-blue-50 p-3">
                  <Maximize2 className="text-primary size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    MAX TENANTS
                  </p>
                  <p className="text-lg font-semibold">
                    {room.maxTenants} people
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facilities & Amenities */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Facilities & Amenities</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {EQUIPMENT_MAP.map(({ icon: Icon, label }, index) => {
                  return (
                    <div
                      key={`equipment-${index}`}
                      className="flex items-center gap-2 rounded-4xl bg-blue-100 px-4 py-3 transition-colors hover:bg-blue-200/80"
                    >
                      <Icon className="text-primary size-5" />
                      <span className="font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          {/* Utility Usage */}
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-lg font-semibold">Utility Usage</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="min-w-36 justify-end">
                    <span className="text-primary font-semibold">
                      {selectedPeriod.label}
                    </span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {SelectedPeriodOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedPeriod(option)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <ElectricityBarChart />
              <WaterBarChart />
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between">
                <p className="text-muted-foreground">Predict bill</p>
                {/* FIXME: Display predict bill based on historical data */}
                <p className="text-lg font-semibold">
                  {formatCurrency(room.monthlyRent)}
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <CheckCircle className="mt-1 size-5 text-green-600" />
                <div>
                  <p className="font-semibold">Rent Paid</p>
                  {/* FIXME: Add real logic */}
                  <p className="text-muted-foreground">
                    {toDateOnlyString(new Date(room.createdAt))}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <AlertCircle className="mt-1 size-5 text-orange-600" />
                <div>
                  <p className="font-semibold">Maintenance Request</p>
                  {/* FIXME: Add real logic */}
                  <p className="text-muted-foreground">
                    {toDateOnlyString(new Date(room.createdAt))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function calculateRentalProgress(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const today = new Date().getTime(); // Skip setHours(0, 0, 0, 0). The difference is small and can be ignored

  const totalDuration = end - start;
  const elapsedDuration = today - start;

  if (totalDuration < 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
}
