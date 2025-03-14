/**
 * Health calculation utilities for fitness tracking 
 */

/**
 * Calculate Basal Metabolic Rate (BMR) using the Harris-Benedict Equation
 * @param weight Weight in kg
 * @param height Height in cm
 * @param age Age in years (defaults to 30 if not provided)
 * @param gender 'male' or 'female'
 * @returns BMR in calories per day
 */
export function calculateBMR(
  weight: number,
  height: number,
  gender: 'male' | 'female',
  age: number = 30
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calculate activity multiplier based on workouts per week
 * @param workoutsPerWeek Number of workouts per week (0-7)
 * @returns Activity multiplier for TDEE calculation
 */
export function getActivityMultiplier(workoutsPerWeek: number): number {
  if (workoutsPerWeek >= 6) {
    return 1.9; // Very active (6+ workouts)
  } else if (workoutsPerWeek >= 3) {
    return 1.55; // Moderately active (3-5 workouts)
  } else {
    return 1.2; // Sedentary (0-2 workouts)
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param bmr Basal Metabolic Rate
 * @param activityMultiplier Activity multiplier based on workouts per week
 * @returns TDEE in calories per day
 */
export function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

/**
 * Calculate target calories based on user's goal
 * @param tdee Total Daily Energy Expenditure
 * @param goalType 'lose', 'maintain', or 'gain'
 * @param goalSpeed Speed factor for weight loss/gain (0.5 = moderate, 1.0 = aggressive)
 * @returns Target calories per day
 */
export function calculateTargetCalories(
  tdee: number,
  goalType: 'lose' | 'maintain' | 'gain',
  goalSpeed: number = 0.8
): number {
  switch (goalType) {
    case 'lose':
      return Math.round(tdee * (1 - goalSpeed * 0.25)); // 20% deficit for standard, adjustable with goalSpeed
    case 'gain':
      return Math.round(tdee * (1 + goalSpeed * 0.25)); // 20% surplus for standard, adjustable with goalSpeed
    case 'maintain':
    default:
      return Math.round(tdee);
  }
}

/**
 * Calculate macro targets based on total calories and weight
 * @param calories Total daily calorie target
 * @param weight Weight in kg
 * @returns Object containing protein, carbs, and fat targets in grams
 */
export function calculateMacroTargets(calories: number, weight: number) {
  // Protein: 1.6g per kg of body weight
  const protein = Math.round(weight * 1.6);
  
  // Fat: 30% of calories (1g fat = 9 calories)
  const fat = Math.round((calories * 0.3) / 9);
  
  // Carbs: Remaining calories (1g carbs = 4 calories)
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);
  
  return { protein, carbs, fat };
}

/**
 * Calculate Body Mass Index (BMI)
 * @param weight Weight in kg
 * @param height Height in cm
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Get BMI category based on BMI value
 * @param bmi BMI value
 * @returns Category as string: 'Underweight', 'Healthy', 'Overweight', or 'Obese'
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) {
    return 'Underweight';
  } else if (bmi < 25) {
    return 'Healthy';
  } else if (bmi < 30) {
    return 'Overweight';
  } else {
    return 'Obese';
  }
}

/**
 * Calculate approximate time to burn calories in hours and minutes
 * @param calories Calories to burn
 * @param weight Weight in kg
 * @returns Object with hours and minutes
 */
export function calculateTimeToBurn(calories: number, weight: number): { hours: number, minutes: number } {
  // Assumes moderate walking at 3.5 mph (3.5 METs)
  // MET formula: calories/hour = MET * weight(kg) * 3.5 / 200 * 60
  const caloriesPerHour = 3.5 * weight * 3.5 / 200 * 60;
  const totalHours = calories / caloriesPerHour;
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  
  return { hours, minutes };
}

/**
 * Calculate Health Score based on user data
 * @param data User data including workouts, goal type, diet type, etc.
 * @returns Health score from 1-10
 */
export function calculateHealthScore(data: {
  workoutsPerWeek: number;
  goalType?: 'lose' | 'maintain' | 'gain';
  goalSpeed?: number;
  dietType?: 'classic' | 'pescatarian' | 'vegetarian' | 'vegan';
  barriers?: string;
  experience?: 'beginner' | 'advanced';
}): number {
  let score = 5; // Start with neutral score

  // Activity level affects score
  if (data.workoutsPerWeek >= 6) score += 2;
  else if (data.workoutsPerWeek >= 3) score += 1;
  
  // Goal type affects score
  if (data.goalType === 'maintain') score += 2;
  else if (data.goalSpeed && data.goalSpeed <= 0.8) score += 1;
  
  // Diet type affects score
  if (['vegetarian', 'vegan', 'pescatarian'].includes(data.dietType || '')) score += 1;
  
  // Experience level
  if (data.experience === 'advanced') score += 1;
  
  // Cap the score at 10
  return Math.min(10, score);
}