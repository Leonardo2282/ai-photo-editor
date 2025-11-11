import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, Sparkles } from "lucide-react";
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0" data-testid="modal-image-detail">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <DialogTitle className="text-2xl font-semibold">Image Details</DialogTitle>
              </div>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed">{prompt}</p>
              <Badge variant="secondary" className="text-xs font-normal">
                {createdAt}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-modal"
              className="flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="rounded-lg overflow-hidden border">
            <BeforeAfterSlider beforeImage={originalUrl} afterImage={editedUrl} />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleDownload} size="lg" data-testid="button-download" className="gap-2">
              <Download className="h-4 w-4" />
              Download Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
