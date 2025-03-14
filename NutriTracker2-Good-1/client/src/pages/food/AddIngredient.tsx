import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreHorizontal, Flame } from "lucide-react";
import { foodService } from "@/lib/services/food";
import { useToast } from "@/hooks/use-toast";

interface NewIngredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
}

export default function AddIngredient() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [ingredient, setIngredient] = useState<NewIngredient>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    portion: ""
  });

  const handleChange = (field: keyof NewIngredient, value: string) => {
    if (isLoading) return;

    let numValue = value;
    if (field !== 'name' && field !== 'portion') {
      numValue = value === "" ? "0" : value.replace(/[^0-9]/g, '');
    }

    setIngredient(prev => ({
      ...prev,
      [field]: field === 'name' || field === 'portion' ? value : parseFloat(numValue) || 0
    }));
  };

  const validateIngredient = () => {
    if (!ingredient.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an ingredient name",
        variant: "destructive"
      });
      return false;
    }

    if (!ingredient.portion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portion size (e.g., tbsp, serving)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateIngredient() || isLoading) return;

    setIsLoading(true);

    try {
      // Clean and validate the data before sending
      const cleanedIngredient = {
        name: ingredient.name.trim(),
        calories: Math.max(0, ingredient.calories),
        protein: Math.max(0, ingredient.protein),
        carbs: Math.max(0, ingredient.carbs),
        fats: Math.max(0, ingredient.fats),
        portion: ingredient.portion.trim()
      };

      const success = await foodService.addCustomIngredient(cleanedIngredient);

      if (success) {
        toast({
          title: "Success",
          description: "Ingredient added successfully"
        });
        // Navigate back to the database page after successful addition
        navigate("/food/database");
      }
    } catch (error: any) {
      console.error("Error adding ingredient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add ingredient",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/food/database">
          <button className="p-2 rounded-full hover:bg-gray-100" disabled={isLoading}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl">Add ingredient</h1>
        <button className="p-2" disabled={isLoading}>
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 flex-1">
        <Input
          value={ingredient.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Ingredient name"
          className="text-lg font-semibold"
          disabled={isLoading}
        />

        <Input
          value={ingredient.portion}
          onChange={e => handleChange('portion', e.target.value)}
          placeholder="Portion (e.g., tbsp, serving)"
          className="text-lg"
          disabled={isLoading}
        />

        <div className="flex items-center gap-2 bg-white rounded-lg p-4 border">
          <Flame className="w-4 h-4" />
          <div className="flex-1">
            <p className="text-gray-600">Calories</p>
            <Input
              type="number"
              value={ingredient.calories || ""}
              onChange={e => handleChange('calories', e.target.value)}
              className="text-xl font-bold p-0 border-none focus-visible:ring-0"
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <span>🥩</span>
              <p>Protein</p>
            </div>
            <Input
              type="number"
              value={ingredient.protein || ""}
              onChange={e => handleChange('protein', e.target.value)}
              className="text-lg font-bold p-0 border-none focus-visible:ring-0"
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
            <span className="text-sm">g</span>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <span>🍚</span>
              <p>Carbs</p>
            </div>
            <Input
              type="number"
              value={ingredient.carbs || ""}
              onChange={e => handleChange('carbs', e.target.value)}
              className="text-lg font-bold p-0 border-none focus-visible:ring-0"
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
            <span className="text-sm">g</span>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <span>🥑</span>
              <p>Fats</p>
            </div>
            <Input
              type="number"
              value={ingredient.fats || ""}
              onChange={e => handleChange('fats', e.target.value)}
              className="text-lg font-bold p-0 border-none focus-visible:ring-0"
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
            <span className="text-sm">g</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button 
        className="w-full bg-black text-white rounded-full py-6 mt-4"
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save Ingredient"}
      </Button>
    </div>
  );
}