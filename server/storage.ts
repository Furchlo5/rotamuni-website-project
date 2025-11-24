import {
  type User,
  type InsertUser,
  type Todo,
  type InsertTodo,
  type QuestionCount,
  type InsertQuestionCount,
  type TimerSession,
  type InsertTimerSession,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTodos(): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, updates: Partial<InsertTodo>): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;

  getQuestionCountsByDate(date: string): Promise<QuestionCount[]>;
  upsertQuestionCount(data: InsertQuestionCount): Promise<QuestionCount>;

  getTimerSessionsByDate(date: string): Promise<TimerSession[]>;
  createTimerSession(session: InsertTimerSession): Promise<TimerSession>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private todos: Map<string, Todo>;
  private questionCounts: Map<string, QuestionCount>;
  private timerSessions: Map<string, TimerSession>;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.questionCounts = new Map();
    this.timerSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = randomUUID();
    const todo: Todo = {
      ...insertTodo,
      id,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(
    id: string,
    updates: Partial<InsertTodo>,
  ): Promise<Todo | undefined> {
    const todo = this.todos.get(id);
    if (!todo) return undefined;

    const updatedTodo = { ...todo, ...updates };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  async getQuestionCountsByDate(date: string): Promise<QuestionCount[]> {
    return Array.from(this.questionCounts.values()).filter(
      (qc) => qc.date === date,
    );
  }

  async upsertQuestionCount(
    data: InsertQuestionCount,
  ): Promise<QuestionCount> {
    const key = `${data.subject}-${data.date}`;
    const existing = Array.from(this.questionCounts.values()).find(
      (qc) => qc.subject === data.subject && qc.date === data.date,
    );

    if (existing) {
      const updated = { ...existing, count: data.count };
      this.questionCounts.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const questionCount: QuestionCount = { ...data, id };
    this.questionCounts.set(id, questionCount);
    return questionCount;
  }

  async getTimerSessionsByDate(date: string): Promise<TimerSession[]> {
    return Array.from(this.timerSessions.values()).filter((ts) => ts.date === date);
  }

  async createTimerSession(
    insertSession: InsertTimerSession,
  ): Promise<TimerSession> {
    const id = randomUUID();
    const session: TimerSession = {
      ...insertSession,
      id,
    };
    this.timerSessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
