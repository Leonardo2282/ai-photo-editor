// Integration: Replit Auth (blueprint:javascript_log_in_with_replit)
import { 
  users, 
  images,
  edits,
  type User, 
  type UpsertUser,
  type Image,
  type InsertImage,
  type Edit,
  type InsertEdit
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Image operations
  createImage(image: InsertImage): Promise<Image>;
  getImage(id: number): Promise<Image | undefined>;
  getUserImages(userId: string): Promise<Image[]>;
  updateImage(id: number, data: Partial<InsertImage>): Promise<Image>;
  deleteImage(id: number): Promise<void>;
  
  // Edit operations
  createEdit(edit: InsertEdit): Promise<Edit>;
  getImageEdits(imageId: number): Promise<Edit[]>;
  updateEdit(id: number, data: Partial<InsertEdit>): Promise<Edit>;
  
  // Saved edit operations
  getLatestSavedChildImage(parentImageId: number, userId: string): Promise<Image | undefined>;
  saveEditAsImage(edit: Edit, parentImage: Image, overwrite: boolean): Promise<Image>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createImage(imageData: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values(imageData)
      .returning();
    return image;
  }

  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async getUserImages(userId: string): Promise<Image[]> {
    return db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(desc(images.createdAt));
  }

  async updateImage(id: number, data: Partial<InsertImage>): Promise<Image> {
    const [image] = await db
      .update(images)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(images.id, id))
      .returning();
    return image;
  }

  async deleteImage(id: number): Promise<void> {
    await db.delete(images).where(eq(images.id, id));
  }

  async createEdit(editData: InsertEdit): Promise<Edit> {
    const [edit] = await db
      .insert(edits)
      .values(editData)
      .returning();
    return edit;
  }

  async getImageEdits(imageId: number): Promise<Edit[]> {
    return db
      .select()
      .from(edits)
      .where(eq(edits.imageId, imageId))
      .orderBy(desc(edits.createdAt));
  }

  async updateEdit(id: number, data: Partial<InsertEdit>): Promise<Edit> {
    const [edit] = await db
      .update(edits)
      .set(data)
      .where(eq(edits.id, id))
      .returning();
    return edit;
  }

  async getLatestSavedChildImage(parentImageId: number, userId: string): Promise<Image | undefined> {
    const [latestChild] = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.parentImageId, parentImageId),
          eq(images.userId, userId),
          eq(images.isOriginal, 0)
        )
      )
      .orderBy(desc(images.createdAt))
      .limit(1);
    return latestChild;
  }

  async saveEditAsImage(edit: Edit, parentImage: Image, overwrite: boolean): Promise<Image> {
    let savedImage: Image;
    
    if (overwrite) {
      // Find the most recent saved child image
      const latestChild = await this.getLatestSavedChildImage(parentImage.id, parentImage.userId);
      
      if (latestChild) {
        // Update the existing child image
        savedImage = await this.updateImage(latestChild.id, {
          currentUrl: edit.resultUrl,
          originalUrl: edit.resultUrl,
        });
      } else {
        // No previous save exists, create new one
        savedImage = await this.createImage({
          userId: parentImage.userId,
          parentImageId: parentImage.id,
          isOriginal: 0,
          originalUrl: edit.resultUrl,
          currentUrl: edit.resultUrl,
          fileName: `edit-${edit.id}-${parentImage.fileName}`,
          fileSize: parentImage.fileSize,
          width: parentImage.width,
          height: parentImage.height,
        });
      }
    } else {
      // Create a new child image
      savedImage = await this.createImage({
        userId: parentImage.userId,
        parentImageId: parentImage.id,
        isOriginal: 0,
        originalUrl: edit.resultUrl,
        currentUrl: edit.resultUrl,
        fileName: `edit-${edit.id}-${parentImage.fileName}`,
        fileSize: parentImage.fileSize,
        width: parentImage.width,
        height: parentImage.height,
      });
    }
    
    // Update the edit to link to the saved image
    await this.updateEdit(edit.id, { savedImageId: savedImage.id });
    
    return savedImage;
  }
}

export const storage = new DatabaseStorage();
