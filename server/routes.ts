// Integration: Replit Auth (blueprint:javascript_log_in_with_replit)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

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

  // Add more protected routes here
  // Example:
  // app.get("/api/protected", isAuthenticated, async (req, res) => {
  //   const userId = req.user?.claims?.sub;
  //   ...
  // });

  const httpServer = createServer(app);

  return httpServer;
}
