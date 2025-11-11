import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Updated for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// Images table - Stores uploaded images and their metadata
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentImageId: integer("parent_image_id").references((): any => images.id, { onDelete: "cascade" }),
  isOriginal: integer("is_original").notNull().default(1),
  originalUrl: text("original_url").notNull(),
  currentUrl: text("current_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("images_user_id_idx").on(table.userId),
  index("images_parent_id_idx").on(table.parentImageId),
]);

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

// Edits table - Stores edit history for images
export const edits = pgTable("edits", {
  id: serial("id").primaryKey(),
  imageId: integer("image_id").notNull().references(() => images.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  resultUrl: text("result_url").notNull(),
  savedImageId: integer("saved_image_id").references(() => images.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("edits_image_id_idx").on(table.imageId),
  index("edits_user_id_idx").on(table.userId),
  index("edits_saved_image_id_idx").on(table.savedImageId),
]);

export const insertEditSchema = createInsertSchema(edits).omit({
  id: true,
  createdAt: true,
});

export type InsertEdit = z.infer<typeof insertEditSchema>;
export type Edit = typeof edits.$inferSelect;
