import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

// DeepAI API key will be read from environment variable
const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;
const DEEPAI_API_URL = "https://api.deepai.org/api/image-editor";

export interface ImageEditRequest {
  imageUrl: string;
  prompt: string;
}

export interface ImageEditResult {
  imageData: string; // base64 encoded image
  mimeType: string;
}

/**
 * Edits an image using the DeepAI "AI Photo Editor" model.
 * It takes an image URL and a text prompt for modification.
 * @param request - The image edit request containing the image URL and prompt.
 * @returns A promise that resolves to the edited image data (base64 and mimeType ).
 */
export async function editImageWithGemini(
  request: ImageEditRequest
): Promise<ImageEditResult> {
  if (!DEEPAI_API_KEY) {
    throw new Error("DEEPAI_API_KEY environment variable is not set.");
  }

  // 1. Fetch the image from the URL
  // The original code used fetch, but axios is better for arraybuffer and form-data
  const imageResponse = await axios.get(request.imageUrl, {
    responseType: "arraybuffer",
  });
  const imageBuffer = Buffer.from(imageResponse.data);
  const mimeType = imageResponse.headers["content-type"] || "image/jpeg";

  // 2. Prepare the multipart form data for DeepAI API
  const formData = new FormData();
  // DeepAI API expects the image to be a file upload or a URL.
  // Since the original logic handles data URLs and external URLs,
  // we'll use the fetched image buffer and send it as a file.
  formData.append("image", imageBuffer, {
    filename: "image.jpg",
    contentType: mimeType,
  });
  formData.append("text", request.prompt);

  // 3. Call the DeepAI API
  try {
    const deepaiResponse = await axios.post(DEEPAI_API_URL, formData, {
      headers: {
        "api-key": DEEPAI_API_KEY,
        ...formData.getHeaders(),
      },
    });

    const outputUrl = deepaiResponse.data.output_url;

    if (!outputUrl) {
      throw new Error("DeepAI API did not return an output URL.");
    }

    // 4. Fetch the resulting image from the output URL
    const resultImageResponse = await axios.get(outputUrl, {
      responseType: "arraybuffer",
    });
    const resultImageBuffer = Buffer.from(resultImageResponse.data);
    const resultMimeType = resultImageResponse.headers["content-type"] || "image/jpeg";

    // 5. Convert to base64 for the client
    const imageData = resultImageBuffer.toString("base64");

    return {
      imageData: imageData,
      mimeType: resultMimeType,
    };
  } catch (error: any) {
    console.error("DeepAI API error:", error);
    
    // Custom error handling for DeepAI
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      if (status === 401) {
        throw new Error("INVALID_API_KEY: Your DeepAI API key is invalid or expired.");
      }
      if (status === 400 && data.err === "Quota Exceeded") {
        throw new Error("QUOTA_EXCEEDED: You've reached your DeepAI API usage limit.");
      }
      throw new Error(`DeepAI API failed with status ${status}: ${data.err || JSON.stringify(data)}`);
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to edit image with DeepAI: ${errorMessage}`);
  }
}

