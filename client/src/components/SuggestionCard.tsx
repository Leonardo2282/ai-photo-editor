import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SuggestionCardProps {
  prompt: string;
  category?: string;
  onClick: () => void;
}

export default function SuggestionCard({ prompt, category, onClick }: SuggestionCardProps) {
  const categoryColors: Record<string, string> = {
    lighting: "border-l-yellow-500",
    color: "border-l-purple-500",
    style: "border-l-blue-500",
    effects: "border-l-green-500",
    default: "border-l-primary"
  };

  const borderColor = category ? categoryColors[category] || categoryColors.default : categoryColors.default;

  return (
    <Card 
      className={`p-4 cursor-pointer hover-elevate active-elevate-2 border-l-4 ${borderColor} min-w-[280px]`}
      onClick={onClick}
      data-testid="card-suggestion"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <p className="text-sm font-mono leading-relaxed">{prompt}</p>
          {category && (
            <span className="text-xs text-muted-foreground capitalize">{category}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
