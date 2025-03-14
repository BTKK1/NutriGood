import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  getDocs
} from "firebase/firestore";
import { 
  calculateBMR, 
  getActivityMultiplier, 
  calculateTDEE, 
  calculateTargetCalories, 
  calculateMacroTargets, 
  calculateBMI, 
  calculateHealthScore 
} from "../health-calculations";

// Weight entry interface
export interface WeightEntry {
  weight: number; // in kg
  date: Date;
  userId: string;
}

// User health profile interface
export interface HealthProfile {
  userId: string;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  workoutsPerWeek: number;
  goalType: 'lose' | 'maintain' | 'gain';
  goalSpeed?: number;
  dietType?: 'classic' | 'pescatarian' | 'vegetarian' | 'vegan';
  experience?: 'beginner' | 'advanced';
  barriers?: string;
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  bmi?: number;
  healthScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Health service for user health data and calculations
 */
export const healthService = {
  /**
   * Get a user's current health profile
   * @param userId Firebase user ID
   */
  async getUserHealthProfile(userId: string): Promise<HealthProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        userId,
        gender: userData.gender,
        height: userData.height,
        weight: userData.weight,
        targetWeight: userData.targetWeight,
        workoutsPerWeek: userData.workoutsPerWeek,
        goalType: userData.goalType,
        goalSpeed: userData.goalSpeed,
        bmr: userData.bmr,
        tdee: userData.tdee,
        targetCalories: userData.targetCalories,
        targetProtein: userData.targetProtein,
        targetCarbs: userData.targetCarbs,
        targetFat: userData.targetFat,
        bmi: userData.bmi,
        healthScore: userData.healthScore,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate()
      };
    } catch (error) {
      console.error('Error getting user health profile:', error);
      throw error;
    }
  },

  /**
   * Create or update a user's health profile with calculated values
   * @param userId Firebase user ID
   * @param data Health profile data
   */
  async updateHealthProfile(userId: string, data: Partial<HealthProfile>): Promise<HealthProfile> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      // Get existing data or use empty object
      const existingData = userDoc.exists() ? userDoc.data() : {};

      // Merge existing and new data
      const mergedData = { ...existingData, ...data };

      // Perform calculations based on complete data
      const calculations = this.calculateHealthMetrics(mergedData as HealthProfile);

      // Create the complete updated profile
      const updatedProfile: HealthProfile = {
        ...mergedData,
        ...calculations,
        userId,
        updatedAt: new Date()
      } as HealthProfile;

      // If creating new profile, set createdAt
      if (!userDoc.exists()) {
        updatedProfile.createdAt = new Date();
      }

      // Update or create document
      await setDoc(userRef, {
        ...updatedProfile,
        updatedAt: Timestamp.fromDate(new Date()),
        createdAt: updatedProfile.createdAt ? Timestamp.fromDate(updatedProfile.createdAt) : Timestamp.fromDate(new Date())
      }, { merge: true });
      console.log('✅ Health profile updated for UID:', userId);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating health profile:', error);
      throw error;
    }
  },

  /**
   * Calculate all health metrics from basic user data
   * @param data Health profile data
   */
  calculateHealthMetrics(data: HealthProfile) {
    if (!data.weight || !data.height || !data.gender || !data.workoutsPerWeek || !data.goalType) {
      return {};
    }

    const bmr = calculateBMR(data.weight, data.height, data.gender);
    const activityMultiplier = getActivityMultiplier(data.workoutsPerWeek);
    const tdee = calculateTDEE(bmr, activityMultiplier);
    const targetCalories = calculateTargetCalories(tdee, data.goalType, data.goalSpeed);
    const macros = calculateMacroTargets(targetCalories, data.weight);
    const bmi = calculateBMI(data.weight, data.height);
    const healthScore = calculateHealthScore({
      workoutsPerWeek: data.workoutsPerWeek,
      goalType: data.goalType,
      goalSpeed: data.goalSpeed,
      dietType: data.dietType as any,
      experience: data.experience as any
    });

    return {
      bmr,
      tdee,
      targetCalories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
      bmi,
      healthScore
    };
  },

  /**
   * Log a new weight entry
   * @param userId Firebase user ID
   * @param weight Weight in kg
   * @param date Date of measurement (defaults to now)
   */
  async logWeight(userId: string, weight: number, date: Date = new Date()): Promise<WeightEntry> {
    try {
      // Add to weight history collection
      const weightEntry = {
        userId,
        weight,
        date: Timestamp.fromDate(date)
      };

      const weightRef = await addDoc(collection(db, 'weight_history'), weightEntry);

      // Also update the current weight in the user profile
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        weight,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Recalculate health metrics with new weight
      await this.recalculateUserMetrics(userId);

      console.log('✅ Weight logged for UID:', userId);
      return {
        userId,
        weight,
        date
      };
    } catch (error) {
      console.error('Error logging weight:', error);
      throw error;
    }
  },

  /**
   * Get weight history for a user
   * @param userId Firebase user ID
   * @param limit Number of entries to return (default 30)
   */
  async getWeightHistory(userId: string, limitCount = 30): Promise<WeightEntry[]> {
    try {
      const weightQuery = query(
        collection(db, 'weight_history'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(weightQuery);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          userId: data.userId,
          weight: data.weight,
          date: data.date.toDate()
        };
      });
    } catch (error) {
      console.error('Error getting weight history:', error);
      throw error;
    }
  },

  /**
   * Recalculate and update a user's health metrics
   * @param userId Firebase user ID
   */
  async recalculateUserMetrics(userId: string): Promise<void> {
    try {
      const profile = await this.getUserHealthProfile(userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      const calculations = this.calculateHealthMetrics(profile);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...calculations,
        updatedAt: Timestamp.fromDate(new Date())
      });
      console.log('✅ Recalculated metrics for UID:', userId);
    } catch (error) {
      console.error('Error recalculating user metrics:', error);
      throw error;
    }
  }
};