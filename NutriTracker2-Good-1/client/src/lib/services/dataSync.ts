import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getOnboardingData, saveOnboardingData, getUserNutritionTargets, saveUserNutritionTargets } from '../onboardingStorage';
import type { User, OnboardingData } from '@shared/schema';

// Use the same interface from onboardingStorage.ts
interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  bmr?: number;
  tdee?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goalType?: string;
  dietType?: string;
  workoutsPerWeek?: number;
}

interface UserProfileData {
  age?: number;
  gender?: 'male' | 'female' | string;
  height?: number;
  weight?: number;
  goalWeight?: number;
  fitnessGoal?: 'lose' | 'maintain' | 'gain' | string;
  activityLevel?: number;
  dietaryPreference?: string;
  workoutsPerWeek?: number;
  healthScore?: number;
  bmr?: number;
  tdee?: number;
  barriers?: string[];
  experience?: string;
}

interface UserData {
  profile: UserProfileData;
  onboardingData: Partial<OnboardingData>;
  nutritionTargets: NutritionTargets;
  exerciseLogs: any[];
  foodLogs: any[];
  lastSyncTime: string;
  onboardingComplete: boolean;
}

// Helper function to create default nutrition targets with required fields
function createDefaultNutritionTargets(): NutritionTargets {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    healthScore: 0
  };
}

export const dataSyncService = {
  /**
   * Sync local data to Firestore
   */
  async syncToFirestore(userId: string) {
    try {
      // Get local data from storage
      const storedNutritionTargets = getUserNutritionTargets(userId);
      const onboardingData = getOnboardingData() || {};

      // Use helper to create default nutrition targets if not available
      const nutritionTargets: NutritionTargets = storedNutritionTargets || createDefaultNutritionTargets();

      // Handle barriers array - the UI now supports multiple selections
      const barriers = Array.isArray(onboardingData.barriers)
        ? onboardingData.barriers
        : onboardingData.barriers 
          ? [onboardingData.barriers] 
          : [];

      // Extract profile data from onboarding data
      const profile: UserProfileData = {
        age: onboardingData.age,
        gender: onboardingData.gender,
        height: onboardingData.height,
        weight: onboardingData.weight,
        goalWeight: onboardingData.targetWeight,
        fitnessGoal: onboardingData.goalType,
        workoutsPerWeek: onboardingData.workoutsPerWeek,
        dietaryPreference: onboardingData.dietType,
        barriers: barriers,
        experience: onboardingData.experience,
        healthScore: nutritionTargets.healthScore,
        bmr: nutritionTargets.bmr,
        tdee: nutritionTargets.tdee
      };

      // Determine if onboarding is complete
      const hasNutritionData = Boolean(
        nutritionTargets && 
        nutritionTargets.calories > 0 && 
        nutritionTargets.protein > 0 &&
        nutritionTargets.carbs > 0 &&
        nutritionTargets.fat > 0
      );

      const hasBodyData = Boolean(
        onboardingData.gender &&
        onboardingData.weight && 
        onboardingData.height
      );

      const hasGoalData = Boolean(
        onboardingData.goalType &&
        onboardingData.workoutsPerWeek
      );

      const onboardingComplete = hasNutritionData && hasBodyData && hasGoalData;

      // Prepare data object
      const userData: UserData = {
        profile,
        onboardingData,
        nutritionTargets,
        exerciseLogs: JSON.parse(localStorage.getItem(`exerciseLogs_${userId}`) || '[]'),
        foodLogs: JSON.parse(localStorage.getItem(`foodLogs_${userId}`) || '[]'),
        lastSyncTime: new Date().toISOString(),
        onboardingComplete
      };

      // Sanitize data before saving to Firestore
      const sanitizedData = JSON.parse(JSON.stringify(userData));

      // Save to Firestore using our improved function
      const { updateUserDocument } = await import('../firebase');

      const updateResult = await updateUserDocument(userId, sanitizedData);

      if (!updateResult) {
        console.error('Failed to update user document in Firestore - attempting direct setDoc');
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, sanitizedData, { merge: true });
        console.log('✅ Fallback setDoc successful for UID:', userId);
      } else {
        console.log('✅ Sync to Firestore successful for UID:', userId);
      }

      // Update last sync timestamp
      this.updateLastSyncTime(userId);

      return true;
    } catch (error) {
      console.error('Error syncing data to Firestore:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  },

  /**
   * Restore data from Firestore to local storage
   */
  async restoreFromFirestore(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data() as UserData;

      // Restore data to local storage
      if (userData.onboardingData) {
        localStorage.setItem('onboardingData', JSON.stringify(userData.onboardingData));
      }

      if (userData.nutritionTargets) {
        const validTargets: NutritionTargets = {
          ...createDefaultNutritionTargets(),
          ...userData.nutritionTargets
        };
        saveUserNutritionTargets(validTargets, userId);
      }

      if (userData.exerciseLogs) {
        localStorage.setItem(`exerciseLogs_${userId}`, JSON.stringify(userData.exerciseLogs));
      }

      if (userData.foodLogs) {
        localStorage.setItem(`foodLogs_${userId}`, JSON.stringify(userData.foodLogs));
      }

      console.log('✅ Restored data from Firestore for UID:', userId);
      return true;
    } catch (error) {
      console.error('Error restoring data from Firestore:', error);
      return false;
    }
  },

  /**
   * Check if user has data in Firestore
   */
  async hasFirestoreData(userId: string): Promise<boolean> {
    try {
      try {
        const { getUserDocument } = await import('../firebase');
        const userData = await getUserDocument(userId);
        console.log('Checking Firestore data using getUserDocument:', userData ? 'Found data' : 'No data found');
        if (userData && Object.keys(userData).length > 0) {
          return true;
        }
      } catch (err) {
        console.warn('Error checking Firestore data with getUserDocument:', err);
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        console.log('Checking Firestore data using direct getDoc:', userDoc.exists() ? 'Found data' : 'No data found');
        return userDoc.exists();
      } catch (directErr) {
        console.error('Error directly checking Firestore data:', directErr);
        return false;
      }
    } catch (error) {
      console.error('Unexpected error checking Firestore data:', error);
      return false;
    }
  },

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(userId: string): Date | null {
    const timestamp = localStorage.getItem(`lastSync_${userId}`);
    return timestamp ? new Date(timestamp) : null;
  },

  /**
   * Update last sync timestamp
   */
  updateLastSyncTime(userId: string) {
    localStorage.setItem(`lastSync_${userId}`, new Date().toISOString());
  }
};