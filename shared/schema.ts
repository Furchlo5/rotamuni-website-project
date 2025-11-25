import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, unique, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const questionCounts = pgTable("question_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  count: integer("count").notNull().default(0),
  date: text("date").notNull(),
}, (table) => ({
  subjectDateUnique: unique().on(table.subject, table.date),
}));

export const timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  duration: integer("duration").notNull(),
  subject: text("subject").notNull(),
  date: text("date").notNull(),
});

export const netResults = pgTable("net_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  examType: text("exam_type").notNull(),
  aytField: text("ayt_field"),
  date: text("date").notNull(),
  publisher: text("publisher").notNull(),
  totalNet: text("total_net").notNull(),
  subjectScores: jsonb("subject_scores").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
});

export const updateTodoSchema = insertTodoSchema.partial();

export const insertQuestionCountSchema = createInsertSchema(questionCounts).omit({
  id: true,
});

export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
});

export const insertNetResultSchema = createInsertSchema(netResults).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;

export type QuestionCount = typeof questionCounts.$inferSelect;
export type InsertQuestionCount = z.infer<typeof insertQuestionCountSchema>;

export type TimerSession = typeof timerSessions.$inferSelect;
export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;

export type NetResult = typeof netResults.$inferSelect;
export type InsertNetResult = z.infer<typeof insertNetResultSchema>;
