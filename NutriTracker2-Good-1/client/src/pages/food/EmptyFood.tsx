import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreHorizontal, Flame, Minus, Plus, X } from "lucide-react";
import { foodService, type Food } from "@/lib/services/food";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function EmptyFood() {
  const [, navigate] = useLocation();
  const [foodName, setFoodName] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<Food[]>([]);
  const [macros, setMacros] = useState<MacroValues>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate total macros whenever ingredients change
  useEffect(() => {
    const totals = ingredients.reduce((acc, curr) => ({
      calories: acc.calories + (curr.calories || 0),
      protein: acc.protein + (curr.protein || 0),
      carbs: acc.carbs + (curr.carbs || 0),
      fats: acc.fats + (curr.fats || 0)
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });

    setMacros(totals);
  }, [ingredients]);

  const handleSave = async () => {
    if (!foodName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a food name first",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive"
      });
      return;
    }

    try {
      const emptyFood = {
        name: foodName,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
        ingredients,
        userId: user.uid,
      };

      await foodService.createEmptyFood(emptyFood, user.uid);
      toast({
        title: "Success",
        description: "Food saved successfully"
      });
      navigate("/food/database");
    } catch (error) {
      console.error("Error creating empty food:", error);
      toast({
        title: "Error",
        description: "Failed to save food",
        variant: "destructive"
      });
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/food/database">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl">Selected food</h1>
        <button className="p-2">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500">4:51 AM</span>
      </div>

      {/* Food Name */}
      <Input 
        value={foodName}
        onChange={e => setFoodName(e.target.value)}
        placeholder="Tap to Name"
        className="text-2xl font-semibold mb-6 border-none p-0 focus-visible:ring-0"
      />

      {/* Servings Counter */}
      <div className="flex items-center justify-end gap-4 mb-8">
        <button 
          className="w-10 h-10 rounded-full border flex items-center justify-center"
          onClick={() => setServings(prev => Math.max(1, prev - 1))}
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-xl">{servings}</span>
        <button 
          className="w-10 h-10 rounded-full border flex items-center justify-center"
          onClick={() => setServings(prev => prev + 1)}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Macros */}
      <div className="mb-6">
        <div className="flex items-center gap-2 bg-white rounded-lg p-4 border mb-4">
          <Flame className="w-4 h-4" />
          <div className="flex-1">
            <p className="text-gray-600">Calories</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{macros.calories}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <span>🥩</span>
              <p>Protein</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold">{macros.protein}</span>
              <span className="text-xl font-bold">g</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <span>🍚</span>
              <p>Carbs</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold">{macros.carbs}</span>
              <span className="text-xl font-bold">g</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <span>🥑</span>
              <p>Fats</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold">{macros.fats}</span>
              <span className="text-xl font-bold">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="flex-1">
        <h3 className="font-medium mb-2">Ingredients</h3>
        {ingredients.length > 0 && (
          <div className="space-y-2 mb-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-sm text-gray-500">{ingredient.calories} cal · {ingredient.portion}</p>
                </div>
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button 
          variant="outline" 
          className="w-full justify-center text-center border rounded-lg"
          onClick={() => navigate("/food/ingredients-list")}
        >
          Add +
        </Button>
      </div>

      {/* Log Button */}
      <Button 
        className="w-full bg-black text-white rounded-full py-6 mt-auto"
        onClick={handleSave}
      >
        Log
      </Button>
    </div>
  );
}