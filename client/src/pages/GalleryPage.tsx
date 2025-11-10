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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Gallery</h1>
            <p className="text-muted-foreground mt-1">
              {galleryImages.length} saved {galleryImages.length === 1 ? 'image' : 'images'}
            </p>
          </div>
          <Link href="/editor">
            <Button data-testid="button-new-edit">
              <Plus className="h-4 w-4 mr-2" />
              New Edit
            </Button>
          </Link>
        </div>

        {galleryImages.length === 0 ? (
          <div className="text-center py-24">
            <div className="rounded-full p-6 bg-muted inline-block mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No images yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by uploading and editing your first image
            </p>
            <Link href="/editor">
              <Button data-testid="button-start-editing">
                <Plus className="h-4 w-4 mr-2" />
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
