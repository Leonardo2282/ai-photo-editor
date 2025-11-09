import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  createdAt: string;
}

export default function ImageDetailModal({
  isOpen,
  onClose,
  originalUrl,
  editedUrl,
  prompt,
  createdAt
}: ImageDetailModalProps) {
  const handleDownload = () => {
    console.log('Download clicked');
    // In real app, this would trigger download
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="modal-image-detail">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">Image Details</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{prompt}</p>
              <p className="text-xs text-muted-foreground mt-1">{createdAt}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <BeforeAfterSlider beforeImage={originalUrl} afterImage={editedUrl} />
          
          <div className="flex justify-end">
            <Button onClick={handleDownload} data-testid="button-download">
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
