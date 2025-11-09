import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditHistoryItemProps {
  id: number;
  thumbnailUrl: string;
  prompt: string;
  timestamp: string;
  isActive?: boolean;
  isSaved?: boolean;
  onSave?: () => void;
  onUseAsBase?: () => void;
}

export default function EditHistoryItem({
  id,
  thumbnailUrl,
  prompt,
  timestamp,
  isActive = false,
  isSaved = false,
  onSave,
  onUseAsBase
}: EditHistoryItemProps) {
  return (
    <Card 
      className={`p-3 hover-elevate cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
      data-testid={`card-edit-${id}`}
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          <img 
            src={thumbnailUrl} 
            alt="Edit preview" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-mono line-clamp-2" data-testid="text-prompt">
            {prompt}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{timestamp}</span>
            {isSaved && (
              <Badge variant="secondary" className="text-xs">Saved</Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onUseAsBase}
          data-testid={`button-use-base-${id}`}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Use as Base
        </Button>
        <Button 
          variant={isSaved ? "secondary" : "default"}
          size="sm" 
          className="flex-1"
          onClick={onSave}
          disabled={isSaved}
          data-testid={`button-save-${id}`}
        >
          <Save className="h-3 w-3 mr-1" />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}
