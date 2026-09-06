import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

import GalleryModal from '@/components/GalleryModal';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Carousel,
  CarouselContent,
  CarouselItem,
  NoDataEmptyState,
} from '@/components/ui';
import { useBuilding } from '@/hooks/api';
import { DialogType } from '@/stores/dialogStore';
import { useDialogStore } from '@/stores/dialogStore';

type BuildingGalleryModalProps = {
  buildingId: string;
};

const GALLERY_IMAGES = Array.from({ length: 5 }).map(
  (_, index) => `https://picsum.photos/800?random=${index}`,
);

// TODO 1: make this component to generic Component UI
// TODO 2: Update UI of this component for more beautiful and user-friendly
export default function BuildingGalleryCard({
  buildingId,
}: BuildingGalleryModalProps) {
  const { openDialog, data: dialogData } = useDialogStore();
  const { data: building } = useBuilding(buildingId);

  if (!building) {
    return <NoDataEmptyState />;
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Photos</h3>
        <Button
          variant="ghost"
          className="text-primary text-xs font-bold"
          onClick={() =>
            openDialog(DialogType.SHOW_IMAGES_GALLERY, {
              selectedImageIndex: 0,
            })
          }
        >
          View Gallery
        </Button>
      </CardHeader>
      <CardContent className="flex-row justify-center">
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
                onClick={() =>
                  openDialog(DialogType.SHOW_IMAGES_GALLERY, {
                    selectedImageIndex: index,
                  })
                }
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
      </CardContent>

      {/* Gallery lightbox modal */}
      <GalleryModal
        title={`Tòa nhà ${building.name}`}
        imageUrls={GALLERY_IMAGES}
        selectedImageIndex={dialogData?.selectedImageIndex || 0}
      />
    </Card>
  );
}
