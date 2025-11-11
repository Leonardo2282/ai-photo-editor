import { ScrollArea } from "@/components/ui/scroll-area";
import EditHistoryItem from "./EditHistoryItem";
import { History, Sparkles } from "lucide-react";

interface Edit {
  id: number;
  thumbnailUrl: string;
  prompt: string;
  timestamp: string;
  isSaved: boolean;
}

interface EditHistoryProps {
  edits: Edit[];
  activeEditId?: number;
  onSave: (id: number) => void;
  onUseAsBase: (id: number) => void;
}

export default function EditHistory({ edits, activeEditId, onSave, onUseAsBase }: EditHistoryProps) {
  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Edit History</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {edits.length} {edits.length === 1 ? 'edit' : 'edits'} applied
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {edits.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No edits yet</p>
              <p className="text-xs text-muted-foreground">
                Apply your first edit to see it here
              </p>
            </div>
          ) : (
            edits.map((edit) => (
              <EditHistoryItem
                key={edit.id}
                {...edit}
                isActive={edit.id === activeEditId}
                onSave={() => onSave(edit.id)}
                onUseAsBase={() => onUseAsBase(edit.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
