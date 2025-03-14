import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  ChevronLeft,
  Flame,
  Apple,
  Bookmark,
} from "lucide-react";
import { foodService, type Food } from "@/lib/services/food";
import { useAuth } from "@/contexts/AuthContext";
import FoodDatabaseGuide from "@/assets/images/Fooddatabase Guide.png";

export default function FoodDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Get the active tab from the current path
  const getActiveTab = () => {
    if (location.includes('/food/meals')) return 'my-meals';
    if (location.includes('/food/my-foods')) return 'my-foods';
    if (location.includes('/food/saved')) return 'saved-scans';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setSuggestedFoods(foodService.getSuggestedFoods());
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'all':
        navigate('/food/all');
        break;
      case 'my-meals':
        navigate('/food/meals');
        break;
      case 'my-foods':
        navigate('/food/my-foods');
        break;
      case 'saved-scans':
        navigate('/food/saved');
        break;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/home">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl font-semibold">Food Database</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Describe what you ate"
          className="w-full pl-10 py-6 bg-gray-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 h-auto p-0 bg-transparent gap-2">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-transparent data-[state=active]:border-black data-[state=active]:border-b-2 rounded-none px-0"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="my-meals"
            className="data-[state=active]:bg-transparent data-[state=active]:border-black data-[state=active]:border-b-2 rounded-none px-0"
          >
            My meals
          </TabsTrigger>
          <TabsTrigger
            value="my-foods"
            className="data-[state=active]:bg-transparent data-[state=active]:border-black data-[state=active]:border-b-2 rounded-none px-0"
          >
            My foods
          </TabsTrigger>
          <TabsTrigger
            value="saved-scans"
            className="data-[state=active]:bg-transparent data-[state=active]:border-black data-[state=active]:border-b-2 rounded-none px-0"
          >
            Saved scans
          </TabsTrigger>
        </TabsList>

        {/* All Tab Content */}
        <TabsContent value="all" className="mt-6">
          {/* Suggestions Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Suggestions</h3>
            <div className="space-y-2">
              {suggestedFoods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium mb-1">{food.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Flame className="w-4 h-4" />
                      <span>
                        {food.calories} cal · {food.portion}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100"
                    onClick={() => navigate("/food/empty")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Custom Ingredient Button */}
          <Button
            variant="outline"
            className="w-full h-14 mt-6 flex items-center justify-center gap-2 border-gray-200"
            onClick={() => navigate("/food/add-ingredient")}
          >
            <Plus className="w-5 h-5" />
            Create Custom Ingredient
          </Button>
        </TabsContent>

        {/* My Meals Tab Content */}
        <TabsContent value="my-meals">
          <Card className="p-8 text-center space-y-3">
            <p className="text-lg font-semibold">You have created no meals.</p>
            <Button
              variant="outline"
              className="w-full py-6"
              onClick={() => navigate("/food/create-meal")}
            >
              Create a Meal
            </Button>
            <p className="text-sm text-gray-500">
              Mix multiple foods together into a meal for easy and fast logging.
            </p>
          </Card>
        </TabsContent>

        {/* My Foods Tab Content */}
        <TabsContent value="my-foods">
          <Card className="p-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🍎</span>
            </div>
            <p className="text-lg font-semibold">You have created no foods.</p>
            <Button
              variant="outline"
              className="w-full py-6"
              onClick={() => navigate("/food/create")}
            >
              Create a Food
            </Button>
            <p className="text-sm text-gray-500">
              Create a food to add it to your database
            </p>
          </Card>
        </TabsContent>

        {/* Saved Scans Tab Content */}
        <TabsContent value="saved-scans">
          <div className="text-center">
            {/* Apple Icon and Title */}
            <div className="mb-4">
              <Apple className="w-12 h-12 text-gray-400 mx-auto" />
              <h2 className="text-2xl font-bold mt-2">No saved foods</h2>
            </div>

            {/* Food Database Guide Image */}
            <img
              src={FoodDatabaseGuide}
              alt="Food Database Guide"
              className="w-full h-[410px] object-cover object-center mb-4"
            />

            {/* Save Instruction */}
            <div className="flex justify-center items-center gap-2 -mt-28">
              <Bookmark className="w-8 h-8" />
              <p className="text-xl font-semibold">
                To save food, press the button
                <br />
                while editing a food log.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}