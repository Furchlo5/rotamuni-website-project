import {
  type User,
  type UpsertUser,
  type Todo,
  type InsertTodo,
  type QuestionCount,
  type InsertQuestionCount,
  type TimerSession,
  type InsertTimerSession,
  type NetResult,
  type InsertNetResult,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface DailyStudyData {
  date: string;
  totalSeconds: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  getTodos(userId: string): Promise<Todo[]>;
  getTodo(id: string, userId: string): Promise<Todo | undefined>;
  createTodo(userId: string, todo: Omit<InsertTodo, 'userId'>): Promise<Todo>;
  updateTodo(id: string, userId: string, updates: Partial<Omit<InsertTodo, 'userId'>>): Promise<Todo | undefined>;
  deleteTodo(id: string, userId: string): Promise<boolean>;

  getQuestionCountsByDate(userId: string, date: string): Promise<QuestionCount[]>;
  getQuestionCountsByDateRange(userId: string, startDate: string, endDate: string): Promise<QuestionCount[]>;
  upsertQuestionCount(userId: string, data: Omit<InsertQuestionCount, 'userId'>): Promise<QuestionCount>;

  getTimerSessionsByDate(userId: string, date: string): Promise<TimerSession[]>;
  getTimerSessionsByDateRange(userId: string, startDate: string, endDate: string): Promise<TimerSession[]>;
  createTimerSession(session: InsertTimerSession): Promise<TimerSession>;

  getStreak(userId: string): Promise<number>;
  getMonthlyStudyData(userId: string, year: number, month: number): Promise<DailyStudyData[]>;

  getNetResults(userId: string): Promise<NetResult[]>;
  createNetResult(data: InsertNetResult): Promise<NetResult>;
  deleteNetResult(id: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private todos: Map<string, Todo>;
  private questionCounts: Map<string, QuestionCount>;
  private timerSessions: Map<string, TimerSession>;
  private netResults: Map<string, NetResult>;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.questionCounts = new Map();
    this.timerSessions = new Map();
    this.netResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id ?? randomUUID();
    const existing = this.users.get(id);
    const user: User = {
      id,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getTodos(userId: string): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(t => t.userId === userId);
  }

  async getTodo(id: string, userId: string): Promise<Todo | undefined> {
    const todo = this.todos.get(id);
    return todo && todo.userId === userId ? todo : undefined;
  }

  async createTodo(userId: string, insertTodo: Omit<InsertTodo, 'userId'>): Promise<Todo> {
    const id = randomUUID();
    const todo: Todo = {
      id,
      userId,
      title: insertTodo.title,
      completed: insertTodo.completed ?? false,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(
    id: string,
    userId: string,
    updates: Partial<Omit<InsertTodo, 'userId'>>,
  ): Promise<Todo | undefined> {
    const todo = this.todos.get(id);
    if (!todo || todo.userId !== userId) return undefined;

    const updatedTodo = { ...todo, ...updates };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    const todo = this.todos.get(id);
    if (!todo || todo.userId !== userId) return false;
    return this.todos.delete(id);
  }

  async getQuestionCountsByDate(userId: string, date: string): Promise<QuestionCount[]> {
    return Array.from(this.questionCounts.values()).filter(
      (qc) => qc.userId === userId && qc.date === date,
    );
  }

  async upsertQuestionCount(
    userId: string,
    data: Omit<InsertQuestionCount, 'userId'>,
  ): Promise<QuestionCount> {
    const existing = Array.from(this.questionCounts.values()).find(
      (qc) => qc.userId === userId && qc.subject === data.subject && qc.date === data.date,
    );

    if (existing) {
      const updated: QuestionCount = {
        ...existing,
        count: data.count ?? 0,
      };
      this.questionCounts.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const questionCount: QuestionCount = {
      id,
      userId,
      subject: data.subject,
      date: data.date,
      count: data.count ?? 0,
    };
    this.questionCounts.set(id, questionCount);
    return questionCount;
  }

  async getTimerSessionsByDate(userId: string, date: string): Promise<TimerSession[]> {
    return Array.from(this.timerSessions.values()).filter(
      (ts) => ts.userId === userId && ts.date === date
    );
  }

  async getQuestionCountsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<QuestionCount[]> {
    return Array.from(this.questionCounts.values()).filter(
      (qc) => qc.userId === userId && qc.date >= startDate && qc.date <= endDate,
    );
  }

  async getTimerSessionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TimerSession[]> {
    return Array.from(this.timerSessions.values()).filter(
      (ts) => ts.userId === userId && ts.date >= startDate && ts.date <= endDate,
    );
  }

  async createTimerSession(
    insertSession: InsertTimerSession,
  ): Promise<TimerSession> {
    const id = randomUUID();
    const session: TimerSession = {
      id,
      userId: insertSession.userId,
      duration: insertSession.duration,
      subject: insertSession.subject,
      date: insertSession.date,
    };
    this.timerSessions.set(id, session);
    return session;
  }

  async getStreak(userId: string): Promise<number> {
    const sessions = Array.from(this.timerSessions.values()).filter(s => s.userId === userId);
    const studyDates = new Set(sessions.map(s => s.date));
    
    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (!studyDates.has(todayStr)) {
      return 0;
    }
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (studyDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async getMonthlyStudyData(userId: string, year: number, month: number): Promise<DailyStudyData[]> {
    const sessions = Array.from(this.timerSessions.values()).filter(s => s.userId === userId);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    
    const dailyData = new Map<string, number>();
    
    sessions.forEach(session => {
      if (session.date.startsWith(monthStr)) {
        const current = dailyData.get(session.date) || 0;
        dailyData.set(session.date, current + session.duration);
      }
    });
    
    return Array.from(dailyData.entries()).map(([date, totalSeconds]) => ({
      date,
      totalSeconds,
    }));
  }

  async getNetResults(userId: string): Promise<NetResult[]> {
    return Array.from(this.netResults.values()).filter(r => r.userId === userId);
  }

  async createNetResult(data: InsertNetResult): Promise<NetResult> {
    const id = randomUUID();
    const result: NetResult = {
      id,
      userId: data.userId,
      examType: data.examType,
      aytField: data.aytField ?? null,
      date: data.date,
      publisher: data.publisher,
      totalNet: data.totalNet,
      subjectScores: data.subjectScores,
      createdAt: new Date(),
    };
    this.netResults.set(id, result);
    return result;
  }

  async deleteNetResult(id: string, userId: string): Promise<boolean> {
    const result = this.netResults.get(id);
    if (result && result.userId === userId) {
      return this.netResults.delete(id);
    }
    return false;
  }
}

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    this.db = drizzle({ client: pool, schema });
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await this.db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getTodos(userId: string): Promise<Todo[]> {
    return await this.db
      .select()
      .from(schema.todos)
      .where(eq(schema.todos.userId, userId));
  }

  async getTodo(id: string, userId: string): Promise<Todo | undefined> {
    const result = await this.db
      .select()
      .from(schema.todos)
      .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createTodo(userId: string, insertTodo: Omit<InsertTodo, 'userId'>): Promise<Todo> {
    const result = await this.db
      .insert(schema.todos)
      .values({ ...insertTodo, userId })
      .returning();
    return result[0];
  }

  async updateTodo(
    id: string,
    userId: string,
    updates: Partial<Omit<InsertTodo, 'userId'>>,
  ): Promise<Todo | undefined> {
    const result = await this.db
      .update(schema.todos)
      .set(updates)
      .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.todos)
      .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getQuestionCountsByDate(userId: string, date: string): Promise<QuestionCount[]> {
    return await this.db
      .select()
      .from(schema.questionCounts)
      .where(and(eq(schema.questionCounts.userId, userId), eq(schema.questionCounts.date, date)));
  }

  async upsertQuestionCount(
    userId: string,
    data: Omit<InsertQuestionCount, 'userId'>,
  ): Promise<QuestionCount> {
    const result = await this.db
      .insert(schema.questionCounts)
      .values({ ...data, userId })
      .onConflictDoUpdate({
        target: [schema.questionCounts.userId, schema.questionCounts.subject, schema.questionCounts.date],
        set: { count: data.count },
      })
      .returning();
    return result[0];
  }

  async getTimerSessionsByDate(userId: string, date: string): Promise<TimerSession[]> {
    return await this.db
      .select()
      .from(schema.timerSessions)
      .where(and(eq(schema.timerSessions.userId, userId), eq(schema.timerSessions.date, date)));
  }

  async getQuestionCountsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<QuestionCount[]> {
    return await this.db
      .select()
      .from(schema.questionCounts)
      .where(
        and(
          eq(schema.questionCounts.userId, userId),
          sql`${schema.questionCounts.date} >= ${startDate}`,
          sql`${schema.questionCounts.date} <= ${endDate}`,
        ),
      );
  }

  async getTimerSessionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TimerSession[]> {
    return await this.db
      .select()
      .from(schema.timerSessions)
      .where(
        and(
          eq(schema.timerSessions.userId, userId),
          sql`${schema.timerSessions.date} >= ${startDate}`,
          sql`${schema.timerSessions.date} <= ${endDate}`,
        ),
      );
  }

  async createTimerSession(
    insertSession: InsertTimerSession,
  ): Promise<TimerSession> {
    const result = await this.db
      .insert(schema.timerSessions)
      .values(insertSession)
      .returning();
    return result[0];
  }

  async getStreak(userId: string): Promise<number> {
    const result = await this.db
      .select({
        date: schema.timerSessions.date,
      })
      .from(schema.timerSessions)
      .where(eq(schema.timerSessions.userId, userId))
      .groupBy(schema.timerSessions.date)
      .orderBy(sql`${schema.timerSessions.date} DESC`);
    
    const studyDates = new Set(result.map(r => r.date));
    
    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (!studyDates.has(todayStr)) {
      return 0;
    }
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (studyDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async getMonthlyStudyData(userId: string, year: number, month: number): Promise<DailyStudyData[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const result = await this.db
      .select({
        date: schema.timerSessions.date,
        totalSeconds: sql<number>`SUM(${schema.timerSessions.duration})`,
      })
      .from(schema.timerSessions)
      .where(
        and(
          eq(schema.timerSessions.userId, userId),
          sql`${schema.timerSessions.date} >= ${startDate}`,
          sql`${schema.timerSessions.date} <= ${endDate}`,
        ),
      )
      .groupBy(schema.timerSessions.date);
    
    return result.map(r => ({
      date: r.date,
      totalSeconds: Number(r.totalSeconds),
    }));
  }

  async getNetResults(userId: string): Promise<NetResult[]> {
    return await this.db
      .select()
      .from(schema.netResults)
      .where(eq(schema.netResults.userId, userId))
      .orderBy(sql`${schema.netResults.date} DESC`);
  }

  async createNetResult(data: InsertNetResult): Promise<NetResult> {
    const result = await this.db
      .insert(schema.netResults)
      .values(data)
      .returning();
    return result[0];
  }

  async deleteNetResult(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.netResults)
      .where(
        and(
          eq(schema.netResults.id, id),
          eq(schema.netResults.userId, userId),
        ),
      )
      .returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
