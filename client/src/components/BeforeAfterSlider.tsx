import { useState, useRef, useEffect } from "react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  afterPrompt?: string;
}

export default function BeforeAfterSlider({ 
  beforeImage, 
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Edited",
  afterPrompt
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeImageRef = useRef<HTMLImageElement>(null);

  // Calculate container height based on image aspect ratio
  useEffect(() => {
    if (!beforeImageRef.current || !containerRef.current) return;

    const img = beforeImageRef.current;
    const container = containerRef.current;
    
    const calculateHeight = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const containerWidth = container.offsetWidth || 800;
      const calculatedHeight = containerWidth / aspectRatio;
      setContainerHeight(calculatedHeight);
    };

    const handleImageLoad = () => {
      calculateHeight();
    };

    // Set up ResizeObserver to recalculate on viewport/parent resize
    const resizeObserver = new ResizeObserver(() => {
      if (img.complete) {
        calculateHeight();
      }
    });
    
    resizeObserver.observe(container);

    if (img.complete) {
      calculateHeight();
    } else {
      img.addEventListener('load', handleImageLoad);
    }

    return () => {
      img.removeEventListener('load', handleImageLoad);
      resizeObserver.disconnect();
    };
  }, [beforeImage]);

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateSliderPosition(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updateSliderPosition(e.touches[0].clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div className="w-full space-y-4">
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-lg border bg-muted/30"
        style={{ height: containerHeight ? `${containerHeight}px` : 'auto' }}
        data-testid="slider-compare"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* After Image (Base Layer) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 h-full w-full object-contain"
          />
          
          {/* Before Image (Clipped Layer) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              ref={beforeImageRef}
              src={beforeImage}
              alt={beforeLabel}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Slider Line and Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-10"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Slider Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full border-4 border-background shadow-lg flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-background"></div>
                <div className="w-0.5 h-4 bg-background"></div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded text-sm font-medium z-10">
            {beforeLabel}
          </div>
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded text-sm font-medium z-10">
            {afterLabel}
          </div>
        </div>
      </div>

      {/* Prompt Display */}
      {afterPrompt && (
        <div className="px-4 py-3 bg-card rounded-lg border text-sm" data-testid="text-edit-prompt">
          <span className="font-semibold text-foreground">Edit Prompt:</span>{" "}
          <span className="text-muted-foreground">{afterPrompt}</span>
        </div>
      )}
    </div>
  );
}
