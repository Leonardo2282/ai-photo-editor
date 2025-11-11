import { GoogleGenAI, RawReferenceImage } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ImageEditRequest {
  imageUrl: string;
  prompt: string;
}

export interface ImageEditResult {
  imageData: string; // base64 encoded image
  mimeType: string;
}

/**
 * Edit an image using Gemini 2.5 Flash Image (Nano Banana) model
 */
export async function editImageWithGemini(
  request: ImageEditRequest
): Promise<ImageEditResult> {
  try {
    // Fetch the image from the URL
    const imageResponse = await fetch(request.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Create a raw reference image with the base image to edit
    const rawReferenceImage = new RawReferenceImage();
    rawReferenceImage.referenceImage = {
      imageBytes: imageBase64,
      mimeType,
    };

    // Call the editImage API
    const response = await genAI.models.editImage({
      model: "gemini-2.5-flash-image",
      prompt: request.prompt,
      referenceImages: [rawReferenceImage],
      config: {
        numberOfImages: 1,
        includeRaiReason: true,
      },
    });

    // Extract the generated image
    const generatedImages = response.generatedImages;
    if (!generatedImages || generatedImages.length === 0) {
      throw new Error("No images generated from Gemini API");
    }

    const image = generatedImages[0].image;
    if (!image || !image.imageBytes) {
      throw new Error("No image data in response");
    }

    return {
      imageData: image.imageBytes,
      mimeType: image.mimeType || "image/jpeg",
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to edit image with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
