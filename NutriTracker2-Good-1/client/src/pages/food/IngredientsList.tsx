import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";

export default function IngredientsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  return (
    <div className="p-4 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/food/empty">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl font-semibold">Select Ingredient</h1>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Input
          placeholder="Search ingredients"
          className="w-full pl-4 py-6 bg-gray-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Create Custom Ingredient Button */}
      <Button
        variant="outline"
        className="w-full h-14 flex items-center justify-center gap-2 border-gray-200"
        onClick={() => navigate("/food/add-ingredient")}
      >
        <Plus className="w-5 h-5" />
        Create Custom Ingredient
      </Button>

      {/* Suggestions Label */}
      <h3 className="font-medium mt-6">Suggestions</h3>
    </div>
  );
}