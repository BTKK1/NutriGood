import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";

interface MacroStats {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function CreateMeal() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("Tap to Name");
  const [macros, setMacros] = useState<MacroStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  return (
    <div className="p-4 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/food/database">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Create Meal</h1>
      </div>

      {/* Name Section */}
      <div 
        className="text-2xl font-bold mb-6 cursor-pointer"
        onClick={() => {/* TODO: Add name edit functionality */}}
      >
        {name}
      </div>

      {/* Macros Display */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-xl font-bold">{macros.calories}</div>
          <div className="text-sm text-gray-500">Calories</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-2xl">🥩</span>
          </div>
          <div className="text-xl font-bold">{macros.protein}g</div>
          <div className="text-sm text-gray-500">Protein</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-2xl">🍚</span>
          </div>
          <div className="text-xl font-bold">{macros.carbs}g</div>
          <div className="text-sm text-gray-500">Carbs</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-2xl">🥑</span>
          </div>
          <div className="text-xl font-bold">{macros.fats}g</div>
          <div className="text-sm text-gray-500">Fats</div>
        </div>
      </div>

      {/* Meal Items Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Meal Items</h2>
        <Button
          variant="outline"
          className="w-full py-6 flex items-center justify-center gap-2"
          onClick={() => navigate("/food/meal-items")}
        >
          <Plus className="w-5 h-5" />
          Add items to this meal
        </Button>
      </div>

      {/* Create Meal Button - Fixed at bottom */}
      <div className="fixed bottom-8 left-4 right-4">
        <Button 
          className="w-full py-6 text-lg font-semibold rounded-xl"
          onClick={() => {/* TODO: Implement meal creation */}}
        >
          Create Meal
        </Button>
      </div>
    </div>
  );
}