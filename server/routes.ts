// Integration: Replit Auth (blueprint:javascript_log_in_with_replit)
// Integration: Object Storage (blueprint:javascript_object_storage)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertImageSchema, edits } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { editImageWithGemini } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth middleware
  await setupAuth(app);

  // Auth route - Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object Storage - Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get presigned upload URL
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Create image record after upload
  app.post("/api/images", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate request body - only metadata from client
      const uploadRequestSchema = z.object({
        uploadUrl: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        width: z.number(),
        height: z.number(),
      });
      const validatedData = uploadRequestSchema.parse(req.body);

      // Set ACL policy and normalize path
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        validatedData.uploadUrl,
        {
          owner: userId,
          visibility: "private", // Images are private to the owner
        }
      );

      // Create image record in database
      const image = await storage.createImage({
        userId,
        originalUrl: objectPath,
        currentUrl: objectPath,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        width: validatedData.width,
        height: validatedData.height,
      });

      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating image:", error);
      res.status(500).json({ error: "Failed to create image" });
    }
  });

  // Get user's images
  app.get("/api/images", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userImages = await storage.getUserImages(userId);
      res.json(userImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  // Get single image
  app.get("/api/images/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        return res.status(400).json({ error: "Invalid image ID" });
      }

      const image = await storage.getImage(imageId);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Ensure user owns the image
      if (image.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(image);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  // Update image (e.g., save an edit as the current version)
  app.put("/api/images/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        return res.status(400).json({ error: "Invalid image ID" });
      }

      const image = await storage.getImage(imageId);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Ensure user owns the image
      if (image.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Validate update data
      const updateSchema = z.object({
        currentUrl: z.string().optional(),
      });
      const validatedData = updateSchema.parse(req.body);

      const updatedImage = await storage.updateImage(imageId, validatedData);
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating image:", error);
      res.status(500).json({ error: "Failed to update image" });
    }
  });

  // Create an edit (generate edited image using Gemini)
  app.post("/api/edits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate request body
      const editRequestSchema = z.object({
        imageId: z.number(),
        prompt: z.string().min(1).max(500),
        baseEditId: z.number().optional(),
      });
      const { imageId, prompt, baseEditId } = editRequestSchema.parse(req.body);

      // Get the image
      const image = await storage.getImage(imageId);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Ensure user owns the image
      if (image.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Determine source image URL
      let sourceImageUrl = image.currentUrl;
      
      // If baseEditId is provided, use that edit's result as the source
      if (baseEditId) {
        const [baseEdit] = await db.select().from(edits).where(eq(edits.id, baseEditId));
        if (!baseEdit) {
          return res.status(404).json({ error: "Base edit not found" });
        }
        
        // Verify ownership
        if (baseEdit.userId !== userId) {
          return res.status(403).json({ error: "Forbidden" });
        }
        
        sourceImageUrl = baseEdit.resultUrl;
        console.log(`Using edit ${baseEditId} as base for new edit`);
      }

      // Download the image from object storage
      const objectStorageService = new ObjectStorageService();
      const imageFile = await objectStorageService.getObjectEntityFile(sourceImageUrl);
      
      // Download the file contents to a buffer
      const [sourceImageBuffer] = await imageFile.download();
      
      // Create a data URL from the buffer
      const sourceImageBase64 = sourceImageBuffer.toString("base64");
      const contentType = (await imageFile.getMetadata())[0].contentType || "image/jpeg";
      const imageDataUrl = `data:${contentType};base64,${sourceImageBase64}`;

      // Call Gemini API to edit the image
      console.log("Calling Gemini API to edit image...", { prompt });
      const editResult = await editImageWithGemini({
        imageUrl: imageDataUrl,
        prompt,
      });

      // Convert base64 to buffer and upload to object storage
      const editedImageBuffer = Buffer.from(editResult.imageData, "base64");
      
      // Get presigned upload URL
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      // Upload the edited image
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: editedImageBuffer,
        headers: {
          "Content-Type": editResult.mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload edited image: ${uploadResponse.statusText}`);
      }

      // Set ACL policy for the uploaded image
      const resultPath = await objectStorageService.trySetObjectEntityAclPolicy(
        uploadURL,
        {
          owner: userId,
          visibility: "private",
        }
      );

      // Save edit to database
      const edit = await storage.createEdit({
        imageId,
        userId,
        prompt,
        resultUrl: resultPath,
      });

      console.log("Edit created successfully:", edit);
      res.status(201).json(edit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      console.error("Error creating edit:", error);
      
      // Handle specific Gemini API errors
      if (error instanceof Error) {
        if (error.message.startsWith("QUOTA_EXCEEDED:")) {
          return res.status(429).json({ 
            error: "API quota exceeded",
            message: "You've reached your Gemini API usage limit. Please try again later or upgrade your plan.",
            details: error.message.replace("QUOTA_EXCEEDED: ", "")
          });
        }
        
        if (error.message.startsWith("INVALID_API_KEY:")) {
          return res.status(500).json({ 
            error: "Configuration error",
            message: "API key configuration issue. Please contact support.",
            details: error.message.replace("INVALID_API_KEY: ", "")
          });
        }
        
        if (error.message.startsWith("API_ACCESS_DENIED:")) {
          return res.status(403).json({ 
            error: "API access denied",
            message: "Unable to access the image editing service. Please try again later.",
            details: error.message.replace("API_ACCESS_DENIED: ", "")
          });
        }
      }
      
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create edit" });
    }
  });

  // Save an edit as a new image in the gallery
  app.post("/api/edits/:editId/save", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const editId = parseInt(req.params.editId);
      const { overwriteLastSave } = z.object({
        overwriteLastSave: z.boolean().default(false),
      }).parse(req.body);

      // Get the edit
      const [edit] = await db.select().from(edits).where(eq(edits.id, editId));
      if (!edit) {
        return res.status(404).json({ error: "Edit not found" });
      }

      // Get the parent image
      const parentImage = await storage.getImage(edit.imageId);
      if (!parentImage) {
        return res.status(404).json({ error: "Parent image not found" });
      }

      // Ensure user owns the edit
      if (edit.userId !== userId || parentImage.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Save the edit as an image
      const savedImage = await storage.saveEditAsImage(edit, parentImage, overwriteLastSave);

      res.status(201).json({
        image: savedImage,
        message: overwriteLastSave ? "Previous save overwritten" : "Saved as new image",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      console.error("Error saving edit:", error);
      res.status(500).json({ error: "Failed to save edit" });
    }
  });

  // Get edits for an image
  app.get("/api/images/:id/edits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        return res.status(400).json({ error: "Invalid image ID" });
      }

      // Verify image exists and user owns it
      const image = await storage.getImage(imageId);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      if (image.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const imageEdits = await storage.getImageEdits(imageId);
      res.json(imageEdits);
    } catch (error) {
      console.error("Error fetching edits:", error);
      res.status(500).json({ error: "Failed to fetch edits" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
