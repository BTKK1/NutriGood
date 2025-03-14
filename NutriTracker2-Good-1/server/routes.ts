import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMealSchema, onboardingSchema } from "@shared/schema";
import { z } from "zod";
import paymentRouter from "./routes/payment";
import foodRouter from "./routes/food";
import { registerFoodAnalysisRoutes } from "./routes/food-analysis";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Mount the payment routes
  app.use('/api/payment', paymentRouter);
  app.use('/api/food', foodRouter);
  
  // Register food analysis routes
  registerFoodAnalysisRoutes(app);

  app.post("/api/onboarding", async (req, res) => {
    try {
      const data = onboardingSchema.parse(req.body);

      // Calculate target calories based on user data
      const bmr = data.gender === "male"
        ? (10 * data.weight + 6.25 * data.height - 5 * 25 + 5)
        : (10 * data.weight + 6.25 * data.height - 5 * 25 - 161);

      const activityMultiplier = 1.2 + (data.workoutsPerWeek * 0.1);
      const targetCalories = Math.round(bmr * activityMultiplier);

      const user = await storage.createUser({
        username: `user_${Date.now()}`,
        gender: data.gender,
        height: Math.round(data.height),
        weight: Math.round(data.weight * 1000), // Convert to grams
        targetCalories,
        workoutsPerWeek: data.workoutsPerWeek,
        goalType: data.goalType,
        targetWeight: data.targetWeight || data.weight,
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid onboarding data" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      // TODO: Get actual user ID from session
      const userId = 1;
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      // TODO: Get actual user ID from session
      const userId = 1;
      const updates = req.body;
      const settings = await storage.updateUserSettings(userId, updates);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const meal = insertMealSchema.parse(req.body);
      const created = await storage.createMeal(meal);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid meal data" });
    }
  });

  app.get("/api/meals/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const meals = await storage.getMealsByDate(userId, date);
    res.json(meals);
  });

  return httpServer;
}