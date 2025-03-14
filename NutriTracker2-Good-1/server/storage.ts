import { type User, type InsertUser, type Meal, type InsertMeal } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Meal operations
  getMealsByUserId(userId: number): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  getMealsByDate(userId: number, date: Date): Promise<Meal[]>;

  // Settings operations
  getUserSettings(userId: number): Promise<{
    liveActivity: boolean;
  }>;
  updateUserSettings(userId: number, settings: {
    liveActivity?: boolean;
  }): Promise<{
    liveActivity: boolean;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meals: Map<number, Meal>;
  private settings: Map<number, {
    liveActivity: boolean;
  }>;
  private userId: number;
  private mealId: number;

  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.settings = new Map();
    this.userId = 1;
    this.mealId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...insertUser,
      id,
      onboardingComplete: false,
      dietType: insertUser.dietType || null,
      barriers: insertUser.barriers || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter(meal => meal.userId === userId)
      .sort((a, b) => b.consumedAt.getTime() - a.consumedAt.getTime());
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = this.mealId++;
    const meal: Meal = {
      ...insertMeal,
      id,
      consumedAt: new Date(),
      imageUrl: insertMeal.imageUrl || null
    };
    this.meals.set(id, meal);
    return meal;
  }

  async getMealsByDate(userId: number, date: Date): Promise<Meal[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.meals.values())
      .filter(meal =>
        meal.userId === userId &&
        meal.consumedAt >= startOfDay &&
        meal.consumedAt <= endOfDay
      );
  }

  async getUserSettings(userId: number): Promise<{ liveActivity: boolean; }> {
    const settings = this.settings.get(userId);
    return settings || { liveActivity: false };
  }

  async updateUserSettings(userId: number, newSettings: { liveActivity?: boolean; }): Promise<{ liveActivity: boolean; }> {
    const currentSettings = await this.getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      ...newSettings
    };
    this.settings.set(userId, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();