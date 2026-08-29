import { FileTextIcon, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { DragEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  type ExistingImageItem,
  ImageFormState,
  type NewImageItem,
} from '@/types';

import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Progress,
  ProgressLabel,
  ProgressValue,
} from './ui';

const MB_SIZE = 1024 * 1024;

type ProgressFileUploadProps = {
  value: ImageFormState;
  onChange: (value: ImageFormState) => void;
  MBSize?: number;
};

export default function ProgressFileUpload({
  value,
  onChange,
  MBSize = 1,
}: ProgressFileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<ImageFormState>(value);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: NewImageItem[] = [];
    const rejectedMessages: string[] = [];
    const maxSize = MBSize * MB_SIZE;

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        rejectedMessages.push(
          `${file.name} (${(file.size / MB_SIZE).toFixed(2)}MB)`,
        );
      } else {
        validFiles.push({
          status: 'new',
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
        });
      }
    });

    if (rejectedMessages.length > 0) {
      toast.error(
        `File(s) exceeds ${maxSize}MB limit: ${rejectedMessages.join(', ')}`,
        {
          position: 'top-center',
        },
      );
    }

    const updatedFiles: ImageFormState = {
      existingImages: uploadFiles.existingImages,
      newImages: [...uploadFiles.newImages, ...validFiles],
    };
    setUploadFiles(updatedFiles);
    onChange(updatedFiles);
  };

  const removeImageFromState = (imageId: string) => {
    const remainingFiles: ImageFormState = {
      existingImages: uploadFiles.existingImages.filter(
        ({ id }) => id !== imageId,
      ),
      newImages: uploadFiles.newImages.filter(({ url, id }) => {
        if (id !== imageId) return true;
        if (url) URL.revokeObjectURL(url);
        return false;
      }),
    };

    setUploadFiles(remainingFiles);
    onChange(remainingFiles);
  };

  return (
    <div className="space-y-4">
      <Card
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="cursor-pointer items-center justify-center border border-dashed"
      >
        <div className="bg-muted rounded-full p-3">
          <Upload className="text-muted-foreground size-5" />
        </div>
        <Label
          className="flex cursor-pointer flex-col text-center"
          htmlFor="fileUpload"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-foreground text-sm font-medium">
            Upload a project image
          </p>
          <p>or, click to browse ({MBSize}MB max)</p>
        </Label>
        <Input
          id="fileUpload"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e.target.files);
          }}
        />
      </Card>

      <div className="space-y-3">
        {uploadFiles.existingImages.map((imageItem) => (
          <ExistingImageItem
            key={imageItem.id}
            imageItem={imageItem}
            onRemove={removeImageFromState}
          />
        ))}
        {uploadFiles.newImages.map((imageItem) => (
          <NewImageItem
            key={imageItem.id}
            imageItem={imageItem}
            onRemove={removeImageFromState}
          />
        ))}
      </div>
    </div>
  );
}
type NewImageItemProps = {
  imageItem: NewImageItem;
  onRemove: (fileId: string) => void;
};

function NewImageItem({ imageItem, onRemove }: NewImageItemProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      const add = Math.round(Math.random() * 100);

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }

        return Math.min(prev + add, 100);
      });
    }, 150);

    return () => {
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <Card className="py-2">
      <CardContent className="flex-row items-center gap-2 px-2">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
          {imageItem.url ? (
            <Image
              src={imageItem.url}
              alt={imageItem.file.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="rounded-md border p-3">
              <FileTextIcon className="size-4" />
            </div>
          )}
        </div>
        <Progress value={progress}>
          <ProgressLabel className="space-x-2">
            <span className="text-foreground">{imageItem.file.name}</span>
            <span className="text-muted-foreground whitespace-nowrap">
              {(imageItem.file.size / MB_SIZE).toFixed(1)} MB
            </span>
          </ProgressLabel>
          <ProgressValue />
        </Progress>
        <Button
          onClick={() => onRemove(imageItem.id)}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hover:text-red-500"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

type ExistingImageItemProps = {
  imageItem: ExistingImageItem;
  onRemove: (fileId: string) => void;
};

function ExistingImageItem({ imageItem, onRemove }: ExistingImageItemProps) {
  const imageUrl = imageItem.url.startsWith('http')
    ? imageItem.url
    : `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN}/${imageItem.url}`;

  return (
    <Card className="py-2">
      <CardContent className="flex-row items-center gap-2 px-2">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
          <Image
            src={imageUrl}
            alt="Existing image"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 truncate">
          <span className="text-foreground">{imageItem.file?.name}</span>
          <span className="text-foregrou text-sm">Ảnh đã tải lên</span>
        </div>
        <Button
          onClick={() => onRemove(imageItem.id)}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hover:text-red-500"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
