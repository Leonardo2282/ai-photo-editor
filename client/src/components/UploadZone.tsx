import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  maxSize?: number;
}

export default function UploadZone({ onFileSelect, maxSize = 20 * 1024 * 1024 }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-all hover-elevate active-elevate-2",
        isDragActive ? "border-primary bg-primary/5" : "border-border"
      )}
      data-testid="dropzone-upload"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "rounded-full p-4 transition-colors",
          isDragActive ? "bg-primary/10" : "bg-muted"
        )}>
          {isDragActive ? (
            <ImageIcon className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? "Drop your image here" : "Drag & drop an image, or click to select"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JPEG, PNG, WebP (max 20MB)
          </p>
        </div>

        {fileRejections.length > 0 && (
          <p className="text-sm text-destructive" data-testid="text-error">
            {fileRejections[0].errors[0].message}
          </p>
        )}
      </div>
    </div>
  );
}
