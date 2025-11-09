import ImageDetailModal from '../ImageDetailModal';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ImageDetailModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Open Image Detail Modal</Button>
      
      <ImageDetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        originalUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop"
        editedUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&sat=-100"
        prompt="Make the sky more dramatic with sunset colors and enhance mountain details"
        createdAt="2 hours ago"
      />
    </div>
  );
}
