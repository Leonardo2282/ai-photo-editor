import ImageCanvas from '../ImageCanvas';

export default function ImageCanvasExample() {
  return (
    <div className="h-screen p-8">
      <ImageCanvas imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop" />
    </div>
  );
}
