import { useState } from "react";
import type { UploadResult } from "@uppy/core";
import UploadZone from "@/components/UploadZone";
import { ObjectUploader } from "@/components/ObjectUploader";
import ImageCanvas from "@/components/ImageCanvas";
import PromptInput from "@/components/PromptInput";
import EditHistory from "@/components/EditHistory";
import PromptSuggestions from "@/components/PromptSuggestions";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Image } from "@shared/schema";

export default function EditorPage() {
  const [uploadedImage, setUploadedImage] = useState<Image | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();
  
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

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("/api/objects/upload", {
      method: "POST",
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      if (result.successful.length === 0) {
        throw new Error("No files uploaded");
      }

      const uploadedFile = result.successful[0];
      const uploadUrl = uploadedFile.uploadURL;
      
      // Get image dimensions
      const dimensions = await getImageDimensions(uploadedFile.data as File);

      // Create image record in database
      const response = await apiRequest("/api/images", {
        method: "POST",
        body: JSON.stringify({
          uploadUrl,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size || 0,
          width: dimensions.width,
          height: dimensions.height,
        }),
      });

      const image: Image = await response.json();
      setUploadedImage(image);

      toast({
        title: "Image uploaded successfully",
        description: "You can now start editing your image with AI",
      });
    } catch (error) {
      console.error("Error creating image record:", error);
      toast({
        title: "Upload failed",
        description: "Failed to save image. Please try again.",
        variant: "destructive",
      });
    }
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
          <div className="flex justify-center">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={20 * 1024 * 1024}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="h-64 w-full max-w-2xl border-2 border-dashed rounded-md hover-elevate active-elevate-2"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full p-4 bg-muted">
                  <UploadIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Click to upload an image</p>
                  <p className="text-sm text-muted-foreground">Supports JPEG, PNG, WebP (max 20MB)</p>
                </div>
              </div>
            </ObjectUploader>
          </div>
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
                beforeImage={uploadedImage.currentUrl}
                afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&sat=-100"
              />
            ) : (
              <ImageCanvas imageUrl={uploadedImage.currentUrl} />
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
