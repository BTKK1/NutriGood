import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export interface Food {
  name: string;
  calories: number;
  portion: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  userId?: string;
}

export interface EmptyFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: Food[];
  userId?: string;
}

const FOODS_COLLECTION = 'foods';
const CUSTOM_INGREDIENTS_COLLECTION = 'custom_ingredients';

// Default suggested foods that will be available to all users
export const SUGGESTED_FOODS: Food[] = [
  { name: 'Peanut Butter', calories: 94, portion: 'tbsp' },
  { name: 'Avocado', calories: 130, portion: 'serving' },
  { name: 'Egg', calories: 74, portion: 'large' },
  { name: 'Apples', calories: 72, portion: 'medium' },
  { name: 'Spinach', calories: 7, portion: 'cup' },
  { name: 'Bananas', calories: 105, portion: 'medium' },
  { name: 'Protein Shake Chocolate', calories: 200, portion: 'serving' }
];

export const foodService = {
  getSuggestedFoods: () => SUGGESTED_FOODS,

  async addCustomIngredient(ingredient: Food): Promise<boolean> {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      // First validate on server
      const response = await fetch('/api/food/custom-ingredient', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: ingredient.name.trim(),
          calories: Math.round(Number(ingredient.calories)) || 0,
          protein: Math.round(Number(ingredient.protein)) || 0,
          carbs: Math.round(Number(ingredient.carbs)) || 0,
          fats: Math.round(Number(ingredient.fats)) || 0,
          portion: ingredient.portion.trim()
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || `Failed to validate ingredient (${response.status})`);
      }

      const validatedIngredient = await response.json();

      // Then save to Firebase
      try {
        await addDoc(collection(db, CUSTOM_INGREDIENTS_COLLECTION), {
          ...validatedIngredient,
          createdAt: new Date()
        });
        return true;
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Error adding custom ingredient:', error);
      throw error;
    }
  },

  async createEmptyFood(food: EmptyFood, userId: string) {
    try {
      const docRef = await addDoc(collection(db, FOODS_COLLECTION), {
        ...food,
        userId,
        createdAt: new Date(),
        type: 'food'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating empty food:', error);
      throw error;
    }
  },

  async getAllIngredients() {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      // Get custom ingredients from Firebase
      const customIngredientsQuery = await getDocs(collection(db, CUSTOM_INGREDIENTS_COLLECTION));
      const customIngredients = customIngredientsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Food[];

      // Combine suggested foods with custom ingredients
      // Add an id to suggested foods to maintain consistency
      const suggestedWithIds = SUGGESTED_FOODS.map((food, index) => ({
        ...food,
        id: `suggested-${index}` // Add a predictable ID for suggested foods
      }));

      return [...suggestedWithIds, ...customIngredients];
    } catch (error) {
      console.error('Error getting all ingredients:', error);
      throw error;
    }
  },

  async getUserFoods(userId: string) {
    try {
      const q = query(
        collection(db, FOODS_COLLECTION), 
        where("userId", "==", userId),
        where("type", "==", "food")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user foods:', error);
      throw error;
    }
  },

  async getUserMeals(userId: string) {
    try {
      const q = query(
        collection(db, FOODS_COLLECTION), 
        where("userId", "==", userId),
        where("type", "==", "meal")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user meals:', error);
      throw error;
    }
  }
};