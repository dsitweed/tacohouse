import { FileTextIcon, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { DragEvent, useEffect, useRef, useState } from 'react';

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

type UploadFileType = {
  file: File;
  imageUrl: string | null;
};

type ProgressFileUploadProps = {
  value: File[];
  onChange: (files: File[]) => void;
};

export default function ProgressFileUpload({
  value,
  onChange,
}: ProgressFileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFileType[]>(
    value.map((file) => ({ file, imageUrl: URL.createObjectURL(file) })),
  );

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

    const newFiles: UploadFileType[] = Array.from(files).map((file) => ({
      file,
      imageUrl: URL.createObjectURL(file),
    }));

    const updatedFiles = [...uploadFiles, ...newFiles];
    setUploadFiles(updatedFiles);
    onChange(updatedFiles.map(({ file }) => file));
  };

  const onRemove = (fileName: string) => {
    const remainingFiles = uploadFiles.filter(({ file, imageUrl }) => {
      if (file.name !== fileName) return true;

      if (imageUrl) URL.revokeObjectURL(imageUrl);

      return false;
    });

    setUploadFiles(remainingFiles);
    onChange(remainingFiles.map(({ file }) => file));
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
          <p>or, click to browse (4MB max)</p>
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
        {uploadFiles &&
          Array.from(uploadFiles).map(({ file, imageUrl }, index) => (
            <UploadedFileItem
              key={file.name + index}
              fileName={file.name}
              fileSize={file.size}
              imageUrl={imageUrl}
              onRemove={onRemove}
            />
          ))}
      </div>
    </div>
  );
}

type UploadedFileItemProps = {
  fileName: string;
  fileSize: number;
  imageUrl: string | null;
  onRemove: (filename: string) => void;
};

function UploadedFileItem({
  fileName,
  fileSize,
  imageUrl,
  onRemove,
}: UploadedFileItemProps) {
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
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={fileName}
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
            <span className="text-foreground">{fileName}</span>
            <span className="text-muted-foreground whitespace-nowrap">
              {Math.round(fileSize)} KB
            </span>
          </ProgressLabel>
          <ProgressValue />
        </Progress>
        <Button
          onClick={() => onRemove(fileName)}
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
