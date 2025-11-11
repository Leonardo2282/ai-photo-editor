import { GoogleGenAI } from "@google/genai";

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
 * Uses generateContent with multimodal approach
 */
export async function editImageWithGemini(
  request: ImageEditRequest
): Promise<ImageEditResult> {
  try {
    // Parse data URL to get image data and mime type
    let imageBase64: string;
    let mimeType: string;

    if (request.imageUrl.startsWith("data:")) {
      // Parse data URL
      const matches = request.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error("Invalid data URL format");
      }
      mimeType = matches[1];
      imageBase64 = matches[2];
    } else {
      // Fetch from URL
      const imageResponse = await fetch(request.imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      imageBase64 = Buffer.from(imageBuffer).toString("base64");
      mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
    }

    // Use generateContent with multimodal input
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: `Edit this image based on the following instruction: ${request.prompt}\n\nReturn only the edited image.`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["image"],
      },
    });

    // Extract the generated image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const content = candidates[0].content;
    if (!content) {
      throw new Error("No content in response");
    }

    const parts = content.parts;
    if (!parts) {
      throw new Error("No parts in response");
    }

    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No image data in response");
    }

    return {
      imageData: imagePart.inlineData.data || "",
      mimeType: imagePart.inlineData.mimeType || "image/jpeg",
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to edit image with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
