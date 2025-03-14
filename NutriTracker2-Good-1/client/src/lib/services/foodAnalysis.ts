import { apiRequest } from "@/lib/queryClient";

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  name?: string;
  timeToBurn?: {
    seconds?: number;
    minutes?: number;
    hours?: number;
  };
}

/**
 * Convert a file to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Analyze a food image using Grok AI
 */
export const analyzeFoodImage = async (imageBase64: string, context?: string): Promise<NutritionAnalysis> => {
  try {
    // Use window.fetch to avoid TypeScript errors
    const response = await window.fetch('/api/food/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64,
        context
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Parse the response and cast to our type
    const data: NutritionAnalysis = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw new Error('Failed to analyze food image');
  }
};

/**
 * Capture an image from the device camera
 */
export const captureImage = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use the back camera
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No image captured'));
      }
    };
    
    input.click();
  });
};

/**
 * Select an image from the device gallery
 */
export const selectImageFromGallery = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No image selected'));
      }
    };
    
    input.click();
  });
};