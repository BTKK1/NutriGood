import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  gender: text("gender").notNull(),
  age: integer("age"), // age in years
  height: integer("height").notNull(), // in cm
  weight: integer("weight").notNull(), // in grams
  targetWeight: integer("target_weight").notNull(), // in grams
  goalType: text("goal_type").notNull(),
  dietType: text("diet_type"),
  barriers: text("barriers"),
  targetCalories: integer("target_calories").notNull(),
  workoutsPerWeek: integer("workouts_per_week").notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(), // in grams
  carbs: integer("carbs").notNull(), // in grams
  fat: integer("fat").notNull(), // in grams
  imageUrl: text("image_url"),
  consumedAt: timestamp("consumed_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  onboardingComplete: true
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  consumedAt: true
});

// Firebase User Schema
export const firebaseUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
});

// Application User Schema
export const userSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional(),
  email: z.string().email(),
  photoURL: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  age: z.number().min(10).max(100).optional(), // age in years
  height: z.number().min(100).max(250).optional(), // in cm
  weight: z.number().min(30).max(200).optional(), // in kg
  targetWeight: z.number().min(30).max(200).optional(), // in kg
  goalType: z.enum(["lose", "maintain", "gain"]).optional(),
  goalSpeed: z.number().min(0.1).max(1.5).optional(),
  dietType: z.enum(["classic", "pescatarian", "vegetarian", "vegan"]).optional(),
  barriers: z.enum([
    "lack of consistency",
    "unhealthy eating habits",
    "lack of support",
    "busy schedule",
    "lack of meal inspiration"
  ]).optional(),
  targetCalories: z.number().min(500).max(5000).optional(),
  targetProtein: z.number().min(20).max(300).optional(),
  targetCarbs: z.number().min(20).max(500).optional(),
  targetFat: z.number().min(10).max(200).optional(),
  workoutsPerWeek: z.number().min(0).max(7).optional(),
  settings: z.object({
    liveActivity: z.boolean().default(false),
  }).default({
    liveActivity: false,
  }),
  onboardingComplete: z.boolean().default(false),
  referralCode: z.string().optional(),
  referrals: z.number().default(0),
  premiumUntil: z.date().nullable().optional(),
});

export const onboardingSchema = z.object({
  source: z.string(),
  gender: z.enum(["male", "female"]),
  age: z.number().min(10).max(100), // age in years
  workoutsPerWeek: z.number().min(0).max(7),
  experience: z.enum(["beginner", "advanced"]),
  goalType: z.enum(["lose", "maintain", "gain"]),
  goalSpeed: z.number().min(0.1).max(1.5).optional(),
  targetWeight: z.number().min(30).max(200),
  dietType: z.enum(["classic", "pescatarian", "vegetarian", "vegan"]).optional(),
  barriers: z.enum([
    "lack of consistency",
    "unhealthy eating habits",
    "lack of support",
    "busy schedule",
    "lack of meal inspiration"
  ]).optional(),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
});

export const mealsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional(),
  consumedAt: z.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = z.infer<typeof mealsSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
export type FirebaseUser = z.infer<typeof firebaseUserSchema>;