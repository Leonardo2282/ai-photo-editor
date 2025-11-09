import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ImageCanvas from "@/components/ImageCanvas";
import PromptInput from "@/components/PromptInput";
import EditHistory from "@/components/EditHistory";
import PromptSuggestions from "@/components/PromptSuggestions";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditorPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Mock data for prototype
  const [edits, setEdits] = useState([
    {
      id: 1,
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      prompt: "Make the sky more dramatic with sunset colors",
      timestamp: "2 mins ago",
      isSaved: false
    }
  ]);

  const mockSuggestions = [
    { id: 1, prompt: "Make the sky more dramatic with sunset colors", category: "lighting" },
    { id: 2, prompt: "Add warm golden hour tones throughout", category: "color" },
    { id: 3, prompt: "Increase contrast and saturation", category: "color" },
    { id: 4, prompt: "Apply vintage film effect", category: "style" },
    { id: 5, prompt: "Add soft bokeh background blur", category: "effects" }
  ];

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    console.log('File uploaded:', file.name);
  };

  const handlePromptSubmit = (prompt: string) => {
    setIsProcessing(true);
    console.log('Processing prompt:', prompt);
    
    // Simulate AI processing
    setTimeout(() => {
      const newEdit = {
        id: edits.length + 1,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
        prompt,
        timestamp: "Just now",
        isSaved: false
      };
      setEdits([newEdit, ...edits]);
      setIsProcessing(false);
      setShowComparison(true);
    }, 2000);
  };

  const handleSaveEdit = (id: number) => {
    setEdits(edits.map(edit => 
      edit.id === id ? { ...edit, isSaved: true } : edit
    ));
    console.log('Saved edit:', id);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setEdits([]);
    setShowComparison(false);
  };

  if (!uploadedImage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Start Editing</h1>
            <p className="text-muted-foreground">Upload an image to begin your AI transformation</p>
          </div>
          <UploadZone onFileSelect={handleFileSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Edit History */}
      <div className="w-80 border-r bg-sidebar flex-shrink-0">
        <EditHistory
          edits={edits}
          activeEditId={edits[0]?.id}
          onSave={handleSaveEdit}
          onUseAsBase={(id) => console.log('Use as base:', id)}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={handleReset} data-testid="button-reset">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload Different Image
            </Button>
          </div>
          
          <div className="relative">
            {isProcessing && <ProcessingIndicator progress={65} />}
            
            {showComparison ? (
              <BeforeAfterSlider
                beforeImage={uploadedImage}
                afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&sat=-100"
              />
            ) : (
              <ImageCanvas imageUrl={uploadedImage} />
            )}
          </div>
        </div>

        {/* Bottom Prompt Area */}
        <div className="border-t bg-background p-6 space-y-4">
          <PromptSuggestions
            suggestions={mockSuggestions}
            onSelect={(prompt) => console.log('Selected suggestion:', prompt)}
          />
          <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
}
