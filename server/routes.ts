import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTodoSchema,
  updateTodoSchema,
  insertQuestionCountSchema,
  insertTimerSessionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/timer-sessions", async (req, res) => {
    try {
      const data = insertTimerSessionSchema.parse(req.body);
      const session = await storage.createTimerSession(data);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create timer session" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
