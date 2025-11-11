import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing?: boolean;
}

export default function PromptInput({ onSubmit, isProcessing = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && !isProcessing) {
      onSubmit(prompt.trim());
      console.log('Prompt submitted:', prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Describe how you want to transform your image... (e.g., 'make the sky more dramatic' or 'add warm sunset tones')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          className="min-h-24 resize-none font-mono text-base pr-24 border-2 focus-visible:border-primary/50"
          data-testid="input-prompt"
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {prompt.length}/500
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Press Enter to generate, Shift + Enter for new line
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isProcessing}
          size="lg"
          data-testid="button-generate"
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
