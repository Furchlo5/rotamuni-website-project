import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTodoSchema,
  updateTodoSchema,
  insertQuestionCountSchema,
  insertTimerSessionSchema,
  insertNetResultSchema,
} from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth endpoint - Get current user (not protected, returns null if not authenticated)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app.get("/api/todos", async (_req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const data = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(data);
      res.json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create todo:", error);
        res.status(500).json({ error: "Failed to create todo" });
      }
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateTodoSchema.parse(req.body);
      const todo = await storage.updateTodo(id, updates);
      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update todo" });
      }
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTodo(id);
      if (!success) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete todo" });
    }
  });

  app.get("/api/question-counts/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const counts = await storage.getQuestionCountsByDate(date);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch question counts" });
    }
  });

  app.post("/api/question-counts", async (req, res) => {
    try {
      const data = insertQuestionCountSchema.parse(req.body);
      const count = await storage.upsertQuestionCount(data);
      res.json(count);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update question count" });
      }
    }
  });

  app.get("/api/timer-sessions/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const sessions = await storage.getTimerSessionsByDate(date);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timer sessions" });
    }
  });

  app.post("/api/timer-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const data = insertTimerSessionSchema.parse(req.body);
      const session = await storage.createTimerSession({ ...data, userId });
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create timer session" });
      }
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ error: "startDate and endDate are required" });
        return;
      }

      const [questionCounts, timerSessions] = await Promise.all([
        storage.getQuestionCountsByDateRange(startDate as string, endDate as string),
        storage.getTimerSessionsByDateRange(startDate as string, endDate as string),
      ]);

      res.json({ questionCounts, timerSessions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get("/api/streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const streak = await storage.getStreak(userId);
      res.json({ streak });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  });

  app.get("/api/monthly-study/:year/:month", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({ error: "Invalid year or month" });
        return;
      }
      
      const data = await storage.getMonthlyStudyData(userId, year, month);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly study data" });
    }
  });

  app.get("/api/net-results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const results = await storage.getNetResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch net results" });
    }
  });

  app.post("/api/net-results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const data = insertNetResultSchema.parse({ ...req.body, userId });
      const result = await storage.createNetResult(data);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Failed to create net result:", error);
        res.status(500).json({ error: "Failed to create net result" });
      }
    }
  });

  app.delete("/api/net-results/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { id } = req.params;
      const success = await storage.deleteNetResult(id, userId);
      if (!success) {
        res.status(404).json({ error: "Net result not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete net result" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
