import { Download, Share } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { DialogType, useDialogStore } from '@/stores/dialogStore';
import { cn } from '@/utils';

import {
  Button,
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
} from './ui';

type GalleryModalProps = {
  title?: string;
  imageUrls: string[];
  selectedImageIndex: number;
};

export default function GalleryModal({
  title,
  imageUrls,
  selectedImageIndex,
}: GalleryModalProps) {
  const { isOpen, type, closeDialog } = useDialogStore();

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(selectedImageIndex);

  const onThumbClick = (index: number) => {
    if (!mainApi || !thumbApi) return;

    mainApi.scrollTo(index);
  };

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;

    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;

    const timeoutId = setTimeout(() => onSelect(), 0);

    mainApi.on('select', onSelect);
    mainApi.on('reInit', onSelect);

    return () => {
      clearTimeout(timeoutId);
      mainApi.off('select', onSelect);
      mainApi.off('reInit', onSelect);
    };
  }, [mainApi, onSelect]);

  // Scroll to the selectedImageIndex image whenever the dialog opens
  useEffect(() => {
    if (!mainApi || !isOpen || type !== DialogType.SHOW_IMAGES_GALLERY) return;

    mainApi.scrollTo(selectedImageIndex, true);
  }, [mainApi, isOpen, type, selectedImageIndex]);

  return (
    <Dialog
      open={isOpen && type === DialogType.SHOW_IMAGES_GALLERY}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
    >
      <DialogContent className="sm:max-w-6xl">
        <h3 className="pr-8 text-xl font-bold">{title}</h3>
        <Carousel setApi={setMainApi} className="w-full min-w-0">
          <CarouselContent className="h-80 lg:h-[calc(70vh)]">
            {imageUrls.map((imageUrl, index) => (
              <CarouselItem key={index}>
                <div className="relative h-full w-full overflow-hidden rounded-xl">
                  <div className="absolute top-2 right-2 z-1 space-x-1">
                    {/* TODO: Add action to share or download the image */}
                    <Button
                      variant="outline"
                      size="icon-xs"
                      title="Share image"
                    >
                      <Share className="text-primary size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      title="Download image"
                    >
                      <Download className="text-primary size-3.5" />
                    </Button>
                  </div>
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

        <Carousel
          setApi={setThumbApi}
          className="w-full min-w-0"
          opts={{
            containScroll: 'keepSnaps',
            dragFree: true,
          }}
        >
          <CarouselContent className="w-full justify-center-safe">
            {imageUrls.map((imageUrl, index) => (
              <CarouselItem
                key={index}
                className="basis-auto cursor-pointer"
                onClick={() => onThumbClick(index)}
              >
                <div
                  className={cn(
                    'relative aspect-square h-10 overflow-hidden rounded-lg',
                    index === selectedIndex
                      ? 'border-primary opacity-100'
                      : 'border-transparent opacity-40 hover:opacity-70',
                  )}
                >
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
      </DialogContent>
    </Dialog>
  );
}
