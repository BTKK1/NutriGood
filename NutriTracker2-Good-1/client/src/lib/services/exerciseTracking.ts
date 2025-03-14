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
  onSnapshot
} from "firebase/firestore";

/**
 * Exercise log entry interface
 */
export interface ExerciseLog {
  id?: string;
  userId: string;
  type: "exercise";
  exerciseType: string;
  description: string;
  duration: number; // in minutes
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  caloriesPerMinute: number;
  icon: string;
  timestamp: Date;
}

/**
 * Daily exercise summary interface
 */
export interface DailyExerciseSummary {
  date: Date;
  totalCaloriesBurned: number;
  totalDuration: number; // in minutes
  exerciseCount: number;
  exercises: {
    type: string;
    calories: number;
    icon: string;
  }[];
}

/**
 * Service for exercise logging and tracking
 */
export const exerciseTrackingService = {
  /**
   * Log an exercise
   * @param userId Firebase user ID
   * @param exerciseData Exercise data to log
   */
  async logExercise(userId: string, exerciseData: Omit<ExerciseLog, 'userId' | 'type' | 'timestamp'>): Promise<ExerciseLog> {
    try {
      const exerciseLog: Omit<ExerciseLog, 'id'> = {
        userId,
        type: "exercise",
        exerciseType: exerciseData.exerciseType,
        description: exerciseData.description,
        duration: exerciseData.duration,
        intensity: exerciseData.intensity,
        caloriesBurned: exerciseData.caloriesBurned,
        caloriesPerMinute: exerciseData.caloriesPerMinute,
        icon: exerciseData.icon,
        timestamp: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'activity_logs'), {
        ...exerciseLog,
        timestamp: Timestamp.fromDate(exerciseLog.timestamp)
      });
      
      return {
        ...exerciseLog,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error logging exercise:', error);
      throw error;
    }
  },
  
  /**
   * Get recent exercise logs for a user
   * @param userId Firebase user ID
   * @param days Number of days to look back (default 1 = today)
   * @param maxEntries Maximum number of entries to return
   */
  async getRecentExerciseLogs(userId: string, days = 1, maxEntries = 10): Promise<ExerciseLog[]> {
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - (days - 1));
      
      const q = query(
        collection(db, 'activity_logs'),
        where('userId', '==', userId),
        where('type', '==', 'exercise'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc'),
        limit(maxEntries)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          exerciseType: data.exerciseType,
          description: data.description,
          duration: data.duration,
          intensity: data.intensity,
          caloriesBurned: data.caloriesBurned,
          caloriesPerMinute: data.caloriesPerMinute,
          icon: data.icon,
          timestamp: data.timestamp.toDate()
        };
      });
    } catch (error) {
      console.error('Error getting recent exercise logs:', error);
      throw error;
    }
  },
  
  /**
   * Subscribe to real-time exercise log updates
   * @param userId Firebase user ID
   * @param callback Function to call with updated logs
   */
  subscribeToExerciseLogs(userId: string, callback: (logs: ExerciseLog[]) => void): () => void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Look back a week by default
    
    const q = query(
      collection(db, 'activity_logs'),
      where('userId', '==', userId),
      where('type', '==', 'exercise'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          exerciseType: data.exerciseType,
          description: data.description,
          duration: data.duration,
          intensity: data.intensity,
          caloriesBurned: data.caloriesBurned,
          caloriesPerMinute: data.caloriesPerMinute,
          icon: data.icon,
          timestamp: data.timestamp.toDate()
        };
      });
      
      callback(logs);
    }, (error) => {
      console.error('Error subscribing to exercise logs:', error);
    });
    
    return unsubscribe;
  },
  
  /**
   * Get daily exercise summary for a user
   * @param userId Firebase user ID
   * @param date Date to get summary for (defaults to today)
   */
  async getDailyExerciseSummary(userId: string, date = new Date()): Promise<DailyExerciseSummary> {
    try {
      // Set time to start of day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Set time to end of day
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Query exercise logs for the specified day
      const q = query(
        collection(db, 'activity_logs'),
        where('userId', '==', userId),
        where('type', '==', 'exercise'),
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const snapshot = await getDocs(q);
      
      // Calculate totals
      let totalCaloriesBurned = 0;
      let totalDuration = 0;
      const exercises: DailyExerciseSummary['exercises'] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalCaloriesBurned += data.caloriesBurned || 0;
        totalDuration += data.duration || 0;
        
        // Group by exercise type
        const existingType = exercises.find(e => e.type === data.exerciseType);
        if (existingType) {
          existingType.calories += data.caloriesBurned || 0;
        } else {
          exercises.push({
            type: data.exerciseType,
            calories: data.caloriesBurned || 0,
            icon: data.icon || '🏋️'
          });
        }
      });
      
      return {
        date: startOfDay,
        totalCaloriesBurned,
        totalDuration,
        exerciseCount: snapshot.size,
        exercises
      };
    } catch (error) {
      console.error('Error getting daily exercise summary:', error);
      throw error;
    }
  },
  
  /**
   * Get weekly exercise data for charts
   * @param userId Firebase user ID
   * @param days Number of days to include (default 7)
   */
  async getWeeklyExerciseData(userId: string, days = 7): Promise<DailyExerciseSummary[]> {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);
      
      // Query exercise logs for the date range
      const q = query(
        collection(db, 'activity_logs'),
        where('userId', '==', userId),
        where('type', '==', 'exercise'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      // Create daily summaries map with default values
      const dailySummaries = new Map<string, DailyExerciseSummary>();
      
      // Initialize with empty data for all days in the range
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        dailySummaries.set(dateString, {
          date: new Date(currentDate),
          totalCaloriesBurned: 0,
          totalDuration: 0,
          exerciseCount: 0,
          exercises: []
        });
      }
      
      // Populate with actual data
      snapshot.forEach(doc => {
        const data = doc.data();
        const logDate = data.timestamp.toDate();
        const dateString = logDate.toISOString().split('T')[0];
        
        const existingSummary = dailySummaries.get(dateString);
        if (existingSummary) {
          existingSummary.totalCaloriesBurned += data.caloriesBurned || 0;
          existingSummary.totalDuration += data.duration || 0;
          existingSummary.exerciseCount += 1;
          
          // Group by exercise type
          const existingType = existingSummary.exercises.find(e => e.type === data.exerciseType);
          if (existingType) {
            existingType.calories += data.caloriesBurned || 0;
          } else {
            existingSummary.exercises.push({
              type: data.exerciseType,
              calories: data.caloriesBurned || 0,
              icon: data.icon || '🏋️'
            });
          }
        }
      });
      
      // Convert map to array and sort by date
      return Array.from(dailySummaries.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
    } catch (error) {
      console.error('Error getting weekly exercise data:', error);
      throw error;
    }
  },
  
  /**
   * Calculate calories burned for a specific exercise
   * @param exerciseType Type of exercise
   * @param duration Duration in minutes
   * @param intensity Intensity level
   * @param weight User's weight in kg (for more accurate calculation)
   */
  calculateCaloriesBurned(
    exerciseType: string, 
    duration: number, 
    intensity: 'low' | 'medium' | 'high', 
    weight: number = 70
  ): number {
    // Base calories per minute by exercise type
    const baseCalories: Record<string, number> = {
      'Running': 10,
      'Jogging': 8,
      'Walking': 4,
      'Weight lifting': 6,
      'Yoga': 4,
      'Swimming': 9,
      'Cycling': 7,
      'HIIT': 12,
      'Dancing': 7,
      'Boxing': 9,
      'Basketball': 8,
      'Soccer': 8,
      'Tennis': 7
    };
    
    // Default to moderate activity if type not found
    const baseCaloriesPerMinute = baseCalories[exerciseType] || 6;
    
    // Intensity multipliers
    const intensityMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3
    };
    
    // Weight adjustment (baseline is 70kg)
    const weightAdjustment = weight / 70;
    
    // Calculate calories burned
    const caloriesPerMinute = baseCaloriesPerMinute * intensityMultiplier[intensity] * weightAdjustment;
    const totalCalories = Math.round(caloriesPerMinute * duration);
    
    return totalCalories;
  },
  
  /**
   * Get appropriate icon for an exercise type
   * @param exerciseType The type of exercise
   */
  getExerciseIcon(exerciseType: string): string {
    const exerciseIcons: Record<string, string> = {
      'Running': '🏃‍♂️',
      'Jogging': '🏃‍♂️',
      'Walking': '🚶‍♂️',
      'Weight lifting': '🏋️‍♂️',
      'Yoga': '🧘‍♂️',
      'Swimming': '🏊‍♂️',
      'Cycling': '🚴‍♂️',
      'HIIT': '⚡',
      'Dancing': '💃',
      'Boxing': '🥊',
      'Basketball': '🏀',
      'Soccer': '⚽',
      'Tennis': '🎾'
    };
    
    return exerciseIcons[exerciseType] || '🏋️';
  }
};