import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  DocumentData
} from "firebase/firestore";

/**
 * Food log entry interface
 */
export interface FoodLog {
  id?: string;
  userId: string;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  portion: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
  createdAt: Date;
}

/**
 * Daily nutrition summary interface
 */
export interface DailyNutritionSummary {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

/**
 * Service for food logging and nutrition tracking
 */
export const foodTrackingService = {
  /**
   * Log a food item
   * @param userId Firebase user ID
   * @param foodData Food data to log
   */
  async logFood(userId: string, foodData: Omit<FoodLog, 'userId' | 'createdAt'>): Promise<FoodLog> {
    try {
      const foodLog: Omit<FoodLog, 'id'> = {
        userId,
        name: foodData.name,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        portion: foodData.portion,
        mealType: foodData.mealType,
        imageUrl: foodData.imageUrl,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'food_logs'), {
        ...foodLog,
        createdAt: Timestamp.fromDate(foodLog.createdAt)
      });
      
      return {
        ...foodLog,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error logging food:', error);
      throw error;
    }
  },
  
  /**
   * Log a meal (multiple food items as a single entry)
   * @param userId Firebase user ID
   * @param name Meal name
   * @param items Food items in the meal
   * @param mealType Meal type (breakfast, lunch, dinner, snack)
   * @param imageUrl Optional image URL
   */
  async logMeal(
    userId: string, 
    name: string, 
    items: Array<{ 
      name: string; 
      calories: number; 
      protein: number; 
      carbs: number; 
      fat: number; 
      portion: string;
    }>,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    imageUrl?: string
  ): Promise<FoodLog> {
    // Calculate totals
    const totals = items.reduce((acc, item) => {
      return {
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    // Log the meal as a single food entry
    return this.logFood(userId, {
      name,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      portion: 'meal',
      mealType,
      imageUrl
    });
  },
  
  /**
   * Get recent food logs for a user
   * @param userId Firebase user ID
   * @param days Number of days to look back (default 1 = today)
   * @param maxEntries Maximum number of entries to return
   */
  async getRecentFoodLogs(userId: string, days = 1, maxEntries = 10): Promise<FoodLog[]> {
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - (days - 1));
      
      const q = query(
        collection(db, 'food_logs'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc'),
        limit(maxEntries)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          portion: data.portion,
          mealType: data.mealType,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate()
        };
      });
    } catch (error) {
      console.error('Error getting recent food logs:', error);
      throw error;
    }
  },
  
  /**
   * Get daily nutrition totals for a user
   * @param userId Firebase user ID
   * @param date Date to get totals for (defaults to today)
   */
  async getDailyNutrition(userId: string, date = new Date()): Promise<DailyNutritionSummary> {
    try {
      // Set time to start of day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Set time to end of day
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Query food logs for the specified day
      const q = query(
        collection(db, 'food_logs'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const snapshot = await getDocs(q);
      
      // Calculate totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalCalories += data.calories || 0;
        totalProtein += data.protein || 0;
        totalCarbs += data.carbs || 0;
        totalFat += data.fat || 0;
      });
      
      return {
        date: startOfDay,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealCount: snapshot.size
      };
    } catch (error) {
      console.error('Error getting daily nutrition:', error);
      throw error;
    }
  },
  
  /**
   * Get weekly nutrition data for charts
   * @param userId Firebase user ID
   * @param days Number of days to include (default 7)
   */
  async getWeeklyNutritionData(userId: string, days = 7): Promise<DailyNutritionSummary[]> {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);
      
      // Query food logs for the date range
      const q = query(
        collection(db, 'food_logs'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      // Create daily summaries map with default values
      const dailySummaries = new Map<string, DailyNutritionSummary>();
      
      // Initialize with empty data for all days in the range
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        dailySummaries.set(dateString, {
          date: new Date(currentDate),
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealCount: 0
        });
      }
      
      // Populate with actual data
      snapshot.forEach(doc => {
        const data = doc.data();
        const logDate = data.createdAt.toDate();
        const dateString = logDate.toISOString().split('T')[0];
        
        const existingSummary = dailySummaries.get(dateString);
        if (existingSummary) {
          existingSummary.totalCalories += data.calories || 0;
          existingSummary.totalProtein += data.protein || 0;
          existingSummary.totalCarbs += data.carbs || 0;
          existingSummary.totalFat += data.fat || 0;
          existingSummary.mealCount += 1;
        }
      });
      
      // Convert map to array and sort by date
      return Array.from(dailySummaries.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
    } catch (error) {
      console.error('Error getting weekly nutrition data:', error);
      throw error;
    }
  }
};