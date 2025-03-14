export function calculateMacroPercentages(calories: number) {
  return {
    protein: Math.round((calories * 0.3) / 4), // 30% protein
    carbs: Math.round((calories * 0.4) / 4),   // 40% carbs
    fat: Math.round((calories * 0.3) / 9),     // 30% fat
  };
}

export function calculateCaloriesLeft(targetCalories: number, consumedCalories: number) {
  return Math.max(0, targetCalories - consumedCalories);
}

export function calculateProgress(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100));
}
