import GalleryItem from '../GalleryItem';

export default function GalleryItemExample() {
  return (
    <div className="p-8 max-w-sm mx-auto">
      <GalleryItem
        id={1}
        thumbnailUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
        prompt="Make the sky more dramatic with sunset colors and enhance the mountain details"
        createdAt="2 hours ago"
        onClick={() => console.log('Gallery item clicked')}
      />
    </div>
  );
}
