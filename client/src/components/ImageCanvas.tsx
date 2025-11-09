import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useState } from "react";

interface ImageCanvasProps {
  imageUrl: string;
  alt?: string;
}

export default function ImageCanvas({ imageUrl, alt = "Editing canvas" }: ImageCanvasProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(Math.min(200, zoom + 25));
  const handleZoomOut = () => setZoom(Math.max(50, zoom - 25));
  const handleFit = () => setZoom(100);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
      <div className="max-h-[70vh] flex items-center justify-center">
        <img 
          src={imageUrl}
          alt={alt}
          style={{ transform: `scale(${zoom / 100})`, maxWidth: '100%', maxHeight: '70vh' }}
          className="object-contain transition-transform duration-200 shadow-lg rounded-md"
          data-testid="img-canvas"
        />
      </div>
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 50}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFit}
          data-testid="button-zoom-fit"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="bg-secondary px-3 flex items-center rounded-md text-sm font-medium">
          {zoom}%
        </div>
      </div>
    </div>
  );
}
