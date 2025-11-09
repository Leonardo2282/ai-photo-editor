import { ScrollArea } from "@/components/ui/scroll-area";
import EditHistoryItem from "./EditHistoryItem";
import { History } from "lucide-react";

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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Edit History</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {edits.length} {edits.length === 1 ? 'edit' : 'edits'}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {edits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No edits yet</p>
              <p className="text-xs mt-1">Your edit history will appear here</p>
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
