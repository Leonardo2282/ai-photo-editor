import GalleryItem from "./GalleryItem";

interface GalleryImage {
  id: number;
  thumbnailUrl: string;
  prompt: string;
  createdAt: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  onItemClick: (id: number) => void;
}

export default function GalleryGrid({ images, onItemClick }: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-muted-foreground space-y-2">
          <p className="text-lg font-medium">No saved images yet</p>
          <p className="text-sm">Edit and save images to see them in your gallery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <GalleryItem
          key={image.id}
          {...image}
          onClick={() => onItemClick(image.id)}
        />
      ))}
    </div>
  );
}
