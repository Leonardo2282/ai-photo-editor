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
    const response = await apiRequest("POST", "/api/objects/upload");
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
      if (!result.successful || result.successful.length === 0) {
        throw new Error("No files uploaded");
      }

      const uploadedFile = result.successful[0];
      const uploadUrl = uploadedFile.uploadURL;
      
      // Get image dimensions
      const dimensions = await getImageDimensions(uploadedFile.data as File);

      // Create image record in database
      const response = await apiRequest("POST", "/api/images", {
        uploadUrl,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size || 0,
        width: dimensions.width,
        height: dimensions.height,
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

  const handlePromptSubmit = async (prompt: string) => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    console.log('Processing prompt:', prompt);
    
    let response: Response | undefined;
    
    try {
      // Call the backend API to generate the edit
      response = await apiRequest("POST", "/api/edits", {
        imageId: uploadedImage.id,
        prompt: prompt,
      });

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json();
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        throw new Error("Failed to generate edit");
      }

      const edit = await response.json();
      
      // Add the new edit to the list
      const newEdit = {
        id: edit.id,
        thumbnailUrl: edit.resultUrl,
        prompt: edit.prompt,
        timestamp: "Just now",
        isSaved: false,
      };
      
      setEdits([newEdit, ...edits]);
      
      // Update the current image to show the edited version
      setUploadedImage({
        ...uploadedImage,
        currentUrl: edit.resultUrl,
      });
      
      setShowComparison(true);
      
      toast({
        title: "Edit complete!",
        description: "Your image has been edited successfully",
      });
    } catch (error) {
      console.error('Error generating edit:', error);
      
      // Default error message
      let errorMessage = "Failed to generate edit. Please try again.";
      let errorTitle = "Edit failed";
      
      // Extract error message from caught error
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for quota exceeded message
        if (errorMessage.includes("quota") || errorMessage.includes("usage limit")) {
          errorTitle = "API Quota Exceeded";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const edit = edits.find(e => e.id === id);
      if (!edit || !uploadedImage) return;

      // Use the edit's resultUrl (thumbnailUrl) for the saved version
      const editedImageUrl = edit.thumbnailUrl;

      // Update the image's currentUrl to the edit's result
      await apiRequest("PUT", `/api/images/${uploadedImage.id}`, {
        currentUrl: editedImageUrl,
      });

      // Update local state
      setEdits(edits.map(e => 
        e.id === id ? { ...e, isSaved: true } : e
      ));

      // Update the uploaded image state to reflect the change
      setUploadedImage({
        ...uploadedImage,
        currentUrl: editedImageUrl,
      });

      toast({
        title: "Edit saved",
        description: "This version is now your current image",
      });
    } catch (error) {
      console.error('Error saving edit:', error);
      toast({
        title: "Save failed",
        description: "Failed to save edit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setEdits([]);
    setShowComparison(false);
  };

  if (!uploadedImage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-3xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Start Editing</h1>
            <p className="text-lg text-muted-foreground">
              Upload an image to begin your AI-powered transformation
            </p>
          </div>
          <div className="flex justify-center">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={20 * 1024 * 1024}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="h-72 w-full max-w-2xl border-2 border-dashed rounded-lg hover-elevate active-elevate-2 transition-all duration-200"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                  <UploadIcon className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-xl font-semibold">Click to upload an image</p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPEG, PNG, WebP (max 20MB)
                  </p>
                </div>
              </div>
            </ObjectUploader>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Edit History */}
      <div className="w-80 border-r flex-shrink-0">
        <EditHistory
          edits={edits}
          activeEditId={edits[0]?.id}
          onSave={handleSaveEdit}
          onUseAsBase={(id) => console.log('Use as base:', id)}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-8 overflow-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleReset} data-testid="button-reset" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Upload Different Image
            </Button>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {isProcessing && <ProcessingIndicator progress={65} />}
            
            {showComparison ? (
              <div className="rounded-lg overflow-hidden border shadow-lg">
                <BeforeAfterSlider
                  beforeImage={uploadedImage.originalUrl}
                  afterImage={uploadedImage.currentUrl}
                />
              </div>
            ) : (
              <ImageCanvas imageUrl={uploadedImage.currentUrl} />
            )}
          </div>
        </div>

        {/* Bottom Prompt Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto p-6 space-y-4">
            <PromptSuggestions
              suggestions={mockSuggestions}
              onSelect={(prompt) => console.log('Selected suggestion:', prompt)}
            />
            <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}
