import { useState, useEffect, useCallback, useRef } from "react";
import type { UploadResult } from "@uppy/core";
import UploadZone from "@/components/UploadZone";
import { ObjectUploader } from "@/components/ObjectUploader";
import ImageCanvas from "@/components/ImageCanvas";
import PromptInput from "@/components/PromptInput";
import EditHistory, { type HistoryItem } from "@/components/EditHistory";
import PromptSuggestions from "@/components/PromptSuggestions";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Image, Edit } from "@shared/schema";
import { EditorCache, debounce } from "@/utils/editorCache";

type EditWithUI = Edit & { isSaved: boolean };

export default function EditorPage() {
  const [uploadedImage, setUploadedImage] = useState<Image | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [currentBaseEditId, setCurrentBaseEditId] = useState<number | null>(null);
  const [overwriteLastSave, setOverwriteLastSave] = useState(false);
  const [promptText, setPromptText] = useState("");
  const { toast } = useToast();
  
  const [edits, setEdits] = useState<EditWithUI[]>([]);

  // Keep refs in sync with state for debounced saves
  const uploadedImageRef = useRef(uploadedImage);
  const editsRef = useRef(edits);
  const currentBaseEditIdRef = useRef(currentBaseEditId);
  const overwriteLastSaveRef = useRef(overwriteLastSave);
  const promptTextRef = useRef(promptText);

  useEffect(() => {
    uploadedImageRef.current = uploadedImage;
    editsRef.current = edits;
    currentBaseEditIdRef.current = currentBaseEditId;
    overwriteLastSaveRef.current = overwriteLastSave;
    promptTextRef.current = promptText;
  }, [uploadedImage, edits, currentBaseEditId, overwriteLastSave, promptText]);

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
      
      // Load cached state for this image
      loadCachedState(image.id);

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

  // Load cached state for an image
  const loadCachedState = (imageId: number) => {
    const cached = EditorCache.load(imageId);
    if (cached) {
      console.log('[EditorPage] Restoring state from cache');
      setEdits(cached.edits || []);
      setCurrentBaseEditId(cached.currentBaseEditId);
      setPromptText(cached.generateInputText);
      setOverwriteLastSave(cached.overwriteLastSave);
    }
  };

  // Save state to cache using refs for latest values
  const saveToCacheFromRefs = useCallback(() => {
    const image = uploadedImageRef.current;
    if (!image) return;
    
    // Cancel any pending debounced saves to prevent stale data from overwriting
    debouncedSaveRef.current.cancel();
    
    EditorCache.save(image.id, {
      edits: editsRef.current,
      currentBaseEditId: currentBaseEditIdRef.current,
      generateInputText: promptTextRef.current,
      overwriteLastSave: overwriteLastSaveRef.current,
    });
  }, []);

  // Create single debounced save instance
  const debouncedSaveRef = useRef(
    debounce(() => {
      const image = uploadedImageRef.current;
      if (!image) return;
      
      EditorCache.save(image.id, {
        edits: editsRef.current,
        currentBaseEditId: currentBaseEditIdRef.current,
        generateInputText: promptTextRef.current,
        overwriteLastSave: overwriteLastSaveRef.current,
      });
    }, 500)
  );

  // Save to cache immediately when edits, base, or overwrite changes (not debounced)
  useEffect(() => {
    if (uploadedImage) {
      saveToCacheFromRefs();
    }
  }, [edits, currentBaseEditId, overwriteLastSave, uploadedImage, saveToCacheFromRefs]);

  // Save before unmounting
  useEffect(() => {
    return () => {
      console.log('[EditorPage] Saving state before unmount');
      saveToCacheFromRefs();
    };
  }, [saveToCacheFromRefs]);

  const handlePromptSubmit = async (prompt: string) => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    console.log('Processing prompt:', prompt);
    
    let response: Response | undefined;
    
    try {
      // Call the backend API to generate the edit
      // If a base edit is selected, pass it to use as the source image
      const requestBody: any = {
        imageId: uploadedImage.id,
        prompt: prompt,
      };
      
      if (currentBaseEditId !== null) {
        requestBody.baseEditId = currentBaseEditId;
        console.log('Using edit as base:', currentBaseEditId);
      }
      
      response = await apiRequest("POST", "/api/edits", requestBody);

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json();
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        throw new Error("Failed to generate edit");
      }

      const edit: Edit = await response.json();
      
      // Add the new edit to the list
      const newEdit: EditWithUI = {
        ...edit,
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
      const response = await apiRequest("POST", `/api/edits/${id}/save`, {
        overwriteLastSave,
      });

      const data = await response.json();

      // Update local state to mark as saved
      setEdits(edits.map(e => 
        e.id === id ? { ...e, isSaved: true } : e
      ));

      toast({
        title: "Saved to gallery",
        description: data.message,
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

  const handleUseAsBase = (id: number | string) => {
    // If it's the original image (string ID like "original-1"), set to null
    // Otherwise use the edit ID
    const baseEditId = typeof id === 'string' ? null : id;
    setCurrentBaseEditId(baseEditId);
    
    const description = baseEditId === null 
      ? "Future edits will use the original uploaded image"
      : "Future edits will be based on this version";
    
    toast({
      title: "Base image updated",
      description,
    });
  };

  const handleReset = () => {
    if (uploadedImage) {
      EditorCache.clear(uploadedImage.id);
    }
    setUploadedImage(null);
    setEdits([]);
    setShowComparison(false);
    setCurrentBaseEditId(null);
    setPromptText("");
    setOverwriteLastSave(false);
  };

  // Handle prompt text change with debounced save
  const handlePromptChange = (text: string) => {
    setPromptText(text);
    debouncedSaveRef.current();
  };

  // Handle suggestion click - append to prompt
  const handleSuggestionSelect = (suggestionText: string) => {
    const newText = promptText.trim()
      ? `${promptText} ${suggestionText}`
      : suggestionText;
    setPromptText(newText);
    debouncedSaveRef.current();
    console.log('[EditorPage] Suggestion selected:', suggestionText);
  };

  // Build combined history array with original image first
  const historyItems: HistoryItem[] = uploadedImage ? [
    {
      id: `original-${uploadedImage.id}`,
      resultUrl: uploadedImage.originalUrl,
      prompt: 'Original',
      createdAt: uploadedImage.createdAt,
      isSaved: false,
      isOriginal: true,
    },
    ...edits.map(edit => ({
      id: edit.id,
      resultUrl: edit.resultUrl,
      prompt: edit.prompt,
      createdAt: edit.createdAt,
      isSaved: edit.isSaved,
      isOriginal: false,
    }))
  ] : [];

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
          historyItems={historyItems}
          activeItemId={edits[0]?.id}
          currentBaseId={currentBaseEditId}
          overwriteLastSave={overwriteLastSave}
          onOverwriteToggle={setOverwriteLastSave}
          onSave={handleSaveEdit}
          onUseAsBase={handleUseAsBase}
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
              (() => {
                const baseEdit = currentBaseEditId !== null 
                  ? edits.find(e => e.id === currentBaseEditId)
                  : null;
                const baseImageUrl = baseEdit?.resultUrl || uploadedImage.originalUrl;
                const isUsingBase = currentBaseEditId !== null && baseEdit !== undefined;
                
                return (
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <BeforeAfterSlider
                      beforeImage={baseImageUrl}
                      afterImage={uploadedImage.currentUrl}
                      beforeLabel={isUsingBase ? "Base" : "Original"}
                      afterLabel="Edited"
                      afterPrompt={edits.length > 0 ? edits[0]?.prompt : undefined}
                    />
                  </div>
                );
              })()
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
              onSelect={handleSuggestionSelect}
            />
            <PromptInput 
              value={promptText}
              onChange={handlePromptChange}
              onSubmit={handlePromptSubmit} 
              isProcessing={isProcessing} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
