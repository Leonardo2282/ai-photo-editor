import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
    // Use Gemini 2.5 Flash Image model (Nano Banana)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // Fetch the image from the URL
    const imageResponse = await fetch(request.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Prepare the request
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
        },
      },
      {
        text: request.prompt,
      },
    ]);

    const response = result.response;
    
    // Extract the generated image from the response
    // The Gemini API returns images in the candidates' content parts
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const parts = candidates[0].content.parts;
    const imagePart = parts.find((part: any) => part.inlineData);
    
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No image data in response");
    }

    return {
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to edit image with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
