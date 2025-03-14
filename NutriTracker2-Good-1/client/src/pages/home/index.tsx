import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { OnboardingData } from "@shared/schema";
import {
  calculateBMR,
  getActivityMultiplier,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroTargets,
  calculateBMI,
  getBMICategory,
  calculateTimeToBurn,
} from "@/lib/health-calculations";
import {
  saveUserNutritionTargets,
  getUserNutritionTargets,
} from "@/lib/onboardingStorage";
import { useDataSync } from "@/hooks/use-data-sync"; // Hypothetical hook for activity data
import { useFoodTracking } from "@/lib/services/foodTracking"; // Hypothetical hook for food data

const Home = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [onboardingData, setOnboardingData] =
    useState<Partial<OnboardingData> | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null); // Updated weight
  const [goalWeight, setGoalWeight] = useState<number | null>(null); // Goal weight
  const [caloriesLeft, setCaloriesLeft] = useState(0);
  const [proteinLeft, setProteinLeft] = useState(0);
  const [carbsLeft, setCarbsLeft] = useState(0);
  const [fatLeft, setFatLeft] = useState(0);
  const [burnTime, setBurnTime] = useState("0h 0m");
  const [steps, setSteps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [bmi, setBMI] = useState(0);
  const [bmiCategory, setBMICategory] = useState("");
  const [goalProgress, setGoalProgress] = useState(0); // Percentage toward goal weight

  // Hypothetical hooks for activity and food data
  const { data: activityData } = useDataSync();
  const { data: foodData } = useFoodTracking();

  useEffect(() => {
    const fetchDataAndCalculatePlan = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const onboarding = data?.onboardingData as Partial<OnboardingData>;
          setOnboardingData(onboarding);
          setCurrentWeight(data?.currentWeight || onboarding?.weight || null);
          setGoalWeight(data?.goalWeight || onboarding?.goalWeight || null);

          // Fetch stored nutrition targets
          const storedTargets = getUserNutritionTargets(user.uid);
          if (storedTargets && currentWeight) {
            updateFromStoredTargets(storedTargets);
          } else if (onboarding) {
            calculatePersonalizedPlan(onboarding);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      // Fetch activity data (e.g., steps, calories burned)
      if (activityData) {
        setSteps(activityData.steps || 0);
        setCaloriesBurned(activityData.caloriesBurned || 0);
      }

      // Fetch food data (for consumption tracking)
      if (foodData) {
        updateProgressFromFoodData(foodData);
      }
    };

    fetchDataAndCalculatePlan();
  }, [user, navigate, activityData, foodData, currentWeight]);

  const updateFromStoredTargets = (targets: any) => {
    setCaloriesLeft(targets.calories || 0);
    setProteinLeft(targets.protein || 0);
    setCarbsLeft(targets.carbs || 0);
    setFatLeft(targets.fat || 0);
    const { hours, minutes } = calculateTimeToBurn(
      targets.calories || 0,
      currentWeight || 70,
    );
    setBurnTime(`${hours}h ${minutes}m`);
  };

  const calculatePersonalizedPlan = (data: Partial<OnboardingData>) => {
    if (
      !data.gender ||
      !data.age ||
      !data.height ||
      !currentWeight ||
      !data.goalType
    ) {
      console.warn("Incomplete data, using defaults.");
      return;
    }

    const weightInKg = currentWeight * 0.453592; // Convert lbs to kg
    const heightInCm = data.height; // Assuming height is in cm from onboarding

    const bmr = calculateBMR(weightInKg, heightInCm, data.gender, data.age);
    const activityMultiplier = getActivityMultiplier(data.workoutsPerWeek || 0);
    const tdee = calculateTDEE(bmr, activityMultiplier);
    const targetCalories = calculateTargetCalories(
      tdee,
      data.goalType,
      data.goalSpeed || 0.8,
    );
    const { protein, carbs, fat } = calculateMacroTargets(
      targetCalories,
      weightInKg,
    );
    const { hours, minutes } = calculateTimeToBurn(targetCalories, weightInKg);

    setCaloriesLeft(Math.round(targetCalories));
    setProteinLeft(protein);
    setCarbsLeft(carbs);
    setFatLeft(fat);
    setBurnTime(`${hours}h ${minutes}m`);

    // Save to localStorage
    saveUserNutritionTargets(
      {
        calories: Math.round(targetCalories),
        protein,
        carbs,
        fat,
        bmr,
        tdee,
        gender: data.gender,
        height: data.height,
        weight: weightInKg,
        goalType: data.goalType,
        dietType: data.dietType,
        workoutsPerWeek: data.workoutsPerWeek,
      },
      user.uid,
    );

    // Calculate BMI
    const bmiValue = calculateBMI(weightInKg, heightInCm / 100); // Convert cm to meters
    setBMI(bmiValue);
    setBMICategory(getBMICategory(bmiValue));

    // Calculate goal progress
    if (goalWeight) {
      const goalWeightKg = goalWeight * 0.453592;
      const progress =
        ((weightInKg - goalWeightKg) / (weightInKg - goalWeightKg)) * 100 ||
        100;
      setGoalProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  const updateProgressFromFoodData = (foodData: any) => {
    const consumedCalories = foodData.calories || 0;
    const consumedProtein = foodData.protein || 0;
    const consumedCarbs = foodData.carbs || 0;
    const consumedFat = foodData.fat || 0;

    setCaloriesLeft((prev) => Math.max(0, prev - consumedCalories));
    setProteinLeft((prev) => Math.max(0, prev - consumedProtein));
    setCarbsLeft((prev) => Math.max(0, prev - consumedCarbs));
    setFatLeft((prev) => Math.max(0, prev - consumedFat));
  };

  // Handle weight update
  const handleWeightUpdate = async (newWeight: number) => {
    if (!user) return;
    setCurrentWeight(newWeight);
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { currentWeight: newWeight }, { merge: true });
    if (onboardingData) calculatePersonalizedPlan(onboardingData);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Saraat AI</h1>
        <span className="text-sm">0</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>
      <div className="flex justify-between text-sm mb-4">
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">{caloriesLeft}</h2>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="30%"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="6"
              />
              <circle
                cx="50%"
                cy="50%"
                r="30%"
                fill="none"
                stroke="#000"
                strokeWidth="6"
                strokeDasharray="188.5"
                strokeDashoffset={
                  188.5 - 188.5 * getProgressPercentage(caloriesLeft, 0)
                } // Dynamic
                transform="rotate(-90 32 32)"
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
              {Math.round(getProgressPercentage(caloriesLeft, 0))}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">Calories left</p>
        <p className="text-xs text-gray-500">⏰ Burns in: {burnTime}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-2 text-center">
          <div className="text-2xl">{proteinLeft}g</div>
          <p className="text-sm text-gray-600">Protein left</p>
          <div className="w-12 h-12 mx-auto mt-1">
            <svg>
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#ff4444"
                strokeWidth="4"
                strokeDasharray="251.2"
                strokeDashoffset={
                  251.2 - 251.2 * getProgressPercentage(proteinLeft, 0)
                } // Dynamic
              />
            </svg>
            <span className="absolute text-sm">
              {Math.round(getProgressPercentage(proteinLeft, 0))}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 text-center">
          <div className="text-2xl">{carbsLeft}g</div>
          <p className="text-sm text-gray-600">Carbs left</p>
          <div className="w-12 h-12 mx-auto mt-1">
            <svg>
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#ffbb33"
                strokeWidth="4"
                strokeDasharray="251.2"
                strokeDashoffset={
                  251.2 - 251.2 * getProgressPercentage(carbsLeft, 0)
                } // Dynamic
              />
            </svg>
            <span className="absolute text-sm">
              {Math.round(getProgressPercentage(carbsLeft, 0))}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 text-center">
          <div className="text-2xl">{fatLeft}g</div>
          <p className="text-sm text-gray-600">Fat left</p>
          <div className="w-12 h-12 mx-auto mt-1">
            <svg>
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="251.2"
                strokeDashoffset={
                  251.2 - 251.2 * getProgressPercentage(fatLeft, 0)
                } // Dynamic
              />
            </svg>
            <span className="absolute text-sm">
              {Math.round(getProgressPercentage(fatLeft, 0))}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Steps today</h3>
            <p className="text-2xl">{steps}</p>
            <p className="text-sm text-red-500">
              ❤️ Connect Apple Health to track your steps
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Calories burned</h3>
            <p className="text-2xl">{caloriesBurned}</p>
            <p className="text-sm text-gray-500">
              Steps +{activityData?.boxingCalories || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-2 mb-4 text-center">
        <h3 className="text-lg font-semibold">Water</h3>
        <p className="text-2xl">
          {waterIntake} fl oz ({waterIntake / 8} cups)
        </p>
        <div className="flex justify-center space-x-2 mt-2">
          <button>-</button>
          <button>+</button>
          <button>⚙️</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold">Goal Weight {goalWeight} lbs</h3>
        <button className="bg-black text-white px-4 py-2 rounded">
          Update
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Current Weight {currentWeight} lbs
          <br />
          Remember to update this at least once a week so we can adjust your
          plan to hit your goal
        </p>
        <button
          className="bg-black text-white w-full mt-2 py-2 rounded"
          onClick={() =>
            handleWeightUpdate(
              prompt("Enter new weight (lbs)") || currentWeight || 118,
            )
          }
        >
          Update your weight
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold">Your BMI</h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold">{bmi.toFixed(1)}</span>
          <span className="ml-2 text-blue-500">{bmiCategory}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${(bmi / 40) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>Underweight</span>
          <span>Healthy</span>
          <span>Overweight</span>
          <span>Obese</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold">Goal Progress</h3>
        <p>{goalProgress.toFixed(0)}% Goal achieved</p>
        <div className="flex space-x-2 mt-2">
          <button>90 Days</button>
          <button>6 Months</button>
          <button>1 Year</button>
          <button>All time</button>
        </div>
        {/* Placeholder for progress chart */}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-2 flex justify-around">
        <button className="text-center">
          <span className="block text-xl">🏠</span>
          <span className="text-xs">Home</span>
        </button>
        <button className="text-center">
          <span className="block text-xl">📊</span>
          <span className="text-xs">Analytics</span>
        </button>
        <button className="text-center">
          <span className="block text-xl">⚙️</span>
          <span className="text-xs">Settings</span>
        </button>
        <button className="text-center">
          <span className="block text-xl">+</span>
          <span className="text-xs"></span>
        </button>
      </div>
    </div>
  );
};

// Helper function to calculate progress percentage
const getProgressPercentage = (left: number, consumed: number) => {
  const total = left + consumed;
  return total > 0 ? (consumed / total) * 100 : 0;
};

export default Home;
