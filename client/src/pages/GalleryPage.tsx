import { useState } from "react";
import GalleryGrid from "@/components/GalleryGrid";
import ImageDetailModal from "@/components/ImageDetailModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Mock data for prototype
  const mockImages = [
    {
      id: 1,
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      prompt: "Make the sky more dramatic with sunset colors and enhance mountain details",
      createdAt: "2 hours ago",
      originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      editedUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&sat=-100"
    },
    {
      id: 2,
      thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
      prompt: "Add warm golden hour lighting with soft glow",
      createdAt: "1 day ago",
      originalUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop",
      editedUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop&sat=-100"
    },
    {
      id: 3,
      thumbnailUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop",
      prompt: "Convert to black and white with high contrast",
      createdAt: "2 days ago",
      originalUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&h=800&fit=crop",
      editedUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&h=800&fit=crop&sat=-100"
    },
    {
      id: 4,
      thumbnailUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop",
      prompt: "Enhance colors and add vibrant saturation for social media",
      createdAt: "3 days ago",
      originalUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop",
      editedUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop&sat=-100"
    },
    {
      id: 5,
      thumbnailUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop",
      prompt: "Add dreamy soft focus with pastel tones",
      createdAt: "5 days ago",
      originalUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop",
      editedUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop&sat=-100"
    },
    {
      id: 6,
      thumbnailUrl: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=400&fit=crop",
      prompt: "Make it look like a professional landscape photo",
      createdAt: "1 week ago",
      originalUrl: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=800&fit=crop",
      editedUrl: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=800&fit=crop&sat=-100"
    }
  ];

  const selectedImageData = selectedImage 
    ? mockImages.find(img => img.id === selectedImage)
    : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Gallery</h1>
            <p className="text-muted-foreground mt-1">
              {mockImages.length} saved {mockImages.length === 1 ? 'image' : 'images'}
            </p>
          </div>
          <Link href="/editor">
            <Button data-testid="button-new-edit">
              <Plus className="h-4 w-4 mr-2" />
              New Edit
            </Button>
          </Link>
        </div>

        <GalleryGrid
          images={mockImages}
          onItemClick={(id) => setSelectedImage(id)}
        />
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
