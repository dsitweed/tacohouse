import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useState } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
  NoDataEmptyState,
} from '@/components/ui';
import { useBuilding } from '@/hooks/api';

type BuildingGalleryModalProps = {
  buildingId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
};

const GALLERY_IMAGES = Array.from({ length: 5 }).map(
  (_, index) => `https://picsum.photos/800?random=${index}`,
);

// TODO 1: make this component to generic Component UI
// TODO 2: Update UI of this component for more beautiful and user-friendly
export default function BuildingGalleryModal({
  buildingId,
  open,
  setOpen,
}: BuildingGalleryModalProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const { data: building } = useBuilding(buildingId);

  if (!building) {
    return <NoDataEmptyState />;
  }

  return (
    <div className="flex justify-center">
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        opts={{
          align: 'start',
        }}
        orientation="vertical"
        className="w-full max-w-xs"
      >
        <CarouselContent className="-mt-1 h-60">
          {GALLERY_IMAGES.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 pt-2"
              onClick={() => setOpen(true)}
            >
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src={imageUrl}
                  alt="Gallery image"
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <h3 className="pr-8 text-xl font-bold">
            Thư viện ảnh tòa nhà {building.name}
          </h3>
          <Carousel
            opts={{
              align: 'start',
            }}
          >
            <CarouselContent className="h-80">
              {GALLERY_IMAGES.map((imageUrl, index) => (
                <CarouselItem key={index} className="pl-4">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    <Image
                      src={imageUrl}
                      alt="Gallery image"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 hidden sm:inline-flex" />
            <CarouselNext className="right-2 hidden sm:inline-flex" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}
