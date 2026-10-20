import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  boolean,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("wb_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  referralCode: varchar("referral_code", { length: 12 }).notNull().unique(),
  referredById: uuid("referred_by_id"),
  balance: integer("balance").notNull().default(0),
  investedCapital: integer("invested_capital").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  referralEarnings: integer("referral_earnings").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("wb_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  tagline: varchar("tagline", { length: 160 }).notNull(),
  minAmount: integer("min_amount").notNull(),
  maxAmount: integer("max_amount").notNull(),
  dailyRate: real("daily_rate").notNull(),
  durationDays: integer("duration_days").notNull(),
  badge: varchar("badge", { length: 40 }),
  color: varchar("color", { length: 20 }).notNull().default("emerald"),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const investments = pgTable("wb_investments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  planId: integer("plan_id").notNull(),
  amount: integer("amount").notNull(),
  dailyProfit: integer("daily_profit").notNull(),
  daysClaimed: integer("days_claimed").notNull().default(0),
  totalClaimed: integer("total_claimed").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  lastClaimAt: timestamp("last_claim_at").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const transactions = pgTable("wb_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  method: varchar("method", { length: 40 }),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DbUser = typeof users.$inferSelect;
export type DbPlan = typeof plans.$inferSelect;
export type DbInvestment = typeof investments.$inferSelect;
export type DbTransaction = typeof transactions.$inferSelect;
