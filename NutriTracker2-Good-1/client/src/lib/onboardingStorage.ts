import { type OnboardingData } from "@shared/schema";

const STORAGE_KEY = 'saraat-pending-onboarding-data';
const USER_TARGETS_KEY = 'saraat-user-nutrition-targets';

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

/**
 * Store onboarding data in localStorage
 */
export const saveOnboardingData = (data: Partial<OnboardingData>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }));
    console.log('Onboarding data saved to localStorage:', data);
  } catch (error) {
    console.error('Error saving onboarding data to localStorage:', error);
  }
};

/**
 * Retrieve onboarding data from localStorage
 */
export const getOnboardingData = (): Partial<OnboardingData> | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving onboarding data from localStorage:', error);
    return null;
  }
};

/**
 * Clear onboarding data from localStorage
 */
export const clearOnboardingData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Onboarding data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing onboarding data from localStorage:', error);
  }
};

/**
 * Check if there is pending onboarding data
 */
export const hasPendingOnboardingData = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};

/**
 * Save user nutrition targets in localStorage
 * This will be used to display their macro/calorie goals on the home screen
 */
export const saveUserNutritionTargets = (targets: NutritionTargets, userId?: string): void => {
  try {
    // Use user-specific key if available, otherwise store for the active user
    const storageKey = userId ? `${USER_TARGETS_KEY}-${userId}` : USER_TARGETS_KEY;
    
    localStorage.setItem(storageKey, JSON.stringify({
      ...targets,
      savedAt: new Date().toISOString()
    }));
    console.log('User nutrition targets saved:', targets);
  } catch (error) {
    console.error('Error saving nutrition targets to localStorage:', error);
  }
};

/**
 * Retrieve user nutrition targets from localStorage
 */
export const getUserNutritionTargets = (userId?: string): NutritionTargets | null => {
  try {
    // Try user-specific key first, then fall back to generic key
    const storageKey = userId ? `${USER_TARGETS_KEY}-${userId}` : USER_TARGETS_KEY;
    const data = localStorage.getItem(storageKey);
    
    if (!data) {
      // Fall back to generic key if user-specific not found
      if (userId) {
        const fallbackData = localStorage.getItem(USER_TARGETS_KEY);
        if (!fallbackData) return null;
        return JSON.parse(fallbackData);
      }
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving nutrition targets from localStorage:', error);
    return null;
  }
};