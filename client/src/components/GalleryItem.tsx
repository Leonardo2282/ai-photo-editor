import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface GalleryItemProps {
  id: number;
  thumbnailUrl: string;
  prompt: string;
  createdAt: string;
  onClick: () => void;
}

export default function GalleryItem({ id, thumbnailUrl, prompt, createdAt, onClick }: GalleryItemProps) {
  return (
    <Card 
      className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2"
      onClick={onClick}
      data-testid={`card-gallery-${id}`}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img 
          src={thumbnailUrl} 
          alt={prompt}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <div className="flex items-center gap-2 text-white">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">View Details</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <p className="text-sm font-mono line-clamp-2" data-testid="text-prompt">
          {prompt}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {createdAt}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
