import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GalleryGrid from "@/components/GalleryGrid";
import ImageDetailModal from "@/components/ImageDetailModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import type { Image } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Fetch user's images from the database
  const { data: userImages = [], isLoading } = useQuery<Image[]>({
    queryKey: ['/api/images'],
  });

  // Transform database images to gallery grid format
  const galleryImages = userImages.map(img => ({
    id: img.id,
    thumbnailUrl: img.currentUrl,
    prompt: img.fileName, // Use filename as fallback since we don't have prompts on images
    createdAt: formatDistanceToNow(new Date(img.createdAt), { addSuffix: true }),
    originalUrl: img.originalUrl,
    editedUrl: img.currentUrl,
  }));

  const selectedImageData = selectedImage 
    ? galleryImages.find(img => img.id === selectedImage)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">My Gallery</h1>
            <p className="text-base text-muted-foreground">
              {galleryImages.length} {galleryImages.length === 1 ? 'image' : 'images'} in your collection
            </p>
          </div>
          <Link href="/editor">
            <Button size="lg" data-testid="button-new-edit" className="gap-2">
              <Plus className="h-4 w-4" />
              New Edit
            </Button>
          </Link>
        </div>

        {galleryImages.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Plus className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No images yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start by uploading and editing your first image to see it appear in your gallery
            </p>
            <Link href="/editor">
              <Button size="lg" data-testid="button-start-editing" className="gap-2">
                <Plus className="h-4 w-4" />
                Start Editing
              </Button>
            </Link>
          </div>
        ) : (
          <GalleryGrid
            images={galleryImages}
            onItemClick={(id) => setSelectedImage(id)}
          />
        )}
      </div>

      {selectedImageData && (
        <ImageDetailModal
          isOpen={selectedImage !== null}
          onClose={() => setSelectedImage(null)}
          originalUrl={selectedImageData.originalUrl}
          editedUrl={selectedImageData.editedUrl}
          prompt={selectedImageData.prompt}
          createdAt={selectedImageData.createdAt}
        />
      )}
    </div>
  );
}
