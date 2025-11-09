import GalleryGrid from '../GalleryGrid';

export default function GalleryGridExample() {
  const mockImages = [
    {
      id: 1,
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      prompt: "Make the sky more dramatic with sunset colors",
      createdAt: "2 hours ago"
    },
    {
      id: 2,
      thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
      prompt: "Add warm golden hour lighting",
      createdAt: "1 day ago"
    },
    {
      id: 3,
      thumbnailUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop",
      prompt: "Convert to black and white with high contrast",
      createdAt: "2 days ago"
    },
    {
      id: 4,
      thumbnailUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop",
      prompt: "Enhance colors and add vibrant saturation",
      createdAt: "3 days ago"
    }
  ];

  return (
    <div className="p-8">
      <GalleryGrid
        images={mockImages}
        onItemClick={(id) => console.log('Clicked image:', id)}
      />
    </div>
  );
}
