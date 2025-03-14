import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Flame } from "lucide-react";
import { foodService, type Food } from "@/lib/services/food";
import { useAuth } from "@/contexts/AuthContext";

// Define a type for food items that may have an ID
type FoodItem = Food & { id?: string };

export default function MealItemsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Load food items on component mount
    const loadItems = async () => {
      try {
        // Start with ingredients
        const ingredients = await foodService.getAllIngredients();
        setItems(ingredients);
        
        // Add user foods if the user is logged in
        if (user) {
          try {
            const userFoods = await foodService.getUserFoods(user.uid);
            
            // Ensure userFoods is valid before using it
            if (Array.isArray(userFoods) && userFoods.length > 0) {
              // Create a new array with existing items + filtered valid user foods
              const validUserFoods = userFoods.filter(food => 
                food && 
                typeof food === 'object' && 
                'name' in food && 
                'calories' in food && 
                'portion' in food
              ) as FoodItem[];
              
              // Only update if we have valid foods
              if (validUserFoods.length > 0) {
                setItems(prev => [...prev, ...validUserFoods]);
              }
            }
          } catch (error) {
            console.error("Failed to load user foods:", error);
          }
        }
      } catch (error) {
        console.error("Error loading meal items:", error);
      }
    };
    
    loadItems();
  }, [user]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/food/create-meal">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Select Items</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Input
          placeholder="Search items"
          className="w-full pl-4 py-6 bg-gray-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium mb-1">{item.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Flame className="w-4 h-4" />
                <span>{item.calories} cal · {item.portion}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
              onClick={() => {
                // TODO: Add the selected item to the meal
                navigate("/food/create-meal");
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
