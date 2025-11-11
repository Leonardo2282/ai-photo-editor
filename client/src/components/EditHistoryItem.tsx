import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Sparkles } from "lucide-react";
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
      className={`p-4 hover-elevate cursor-pointer transition-all duration-200 ${
        isActive ? 'ring-2 ring-primary bg-primary/10 shadow-md' : ''
      }`}
      data-testid={`card-edit-${id}`}
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted/50 border">
          <img 
            src={thumbnailUrl} 
            alt="Edit preview" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0 space-y-3">
          <div className="space-y-1">
            <div className="flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm font-mono line-clamp-2 leading-relaxed" data-testid="text-prompt">
                {prompt}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timestamp}</span>
              {isSaved && (
                <Badge variant="secondary" className="text-xs font-normal">Saved</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-1.5"
          onClick={onUseAsBase}
          data-testid={`button-use-base-${id}`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Use as Base
        </Button>
        <Button 
          variant={isSaved ? "secondary" : "default"}
          size="sm" 
          className="flex-1 gap-1.5"
          onClick={onSave}
          disabled={isSaved}
          data-testid={`button-save-${id}`}
        >
          <Save className="h-3.5 w-3.5" />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}
