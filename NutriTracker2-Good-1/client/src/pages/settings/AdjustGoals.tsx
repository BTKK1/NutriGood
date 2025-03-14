import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdjustGoals() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current goals
  const { data: goals } = useQuery({
    queryKey: ['/api/user/1'],
    queryFn: async () => {
      const res = await fetch('/api/user/1');
      if (!res.ok) return {
        targetCalories: 2000,
        proteinTarget: 120,
        carbsTarget: 300,
        fatTarget: 70
      };
      return res.json();
    }
  });

  const [calories, setCalories] = useState(goals?.targetCalories ?? 2000);
  const [protein, setProtein] = useState(goals?.proteinTarget ?? 120);
  const [carbs, setCarbs] = useState(goals?.carbsTarget ?? 300);
  const [fat, setFat] = useState(goals?.fatTarget ?? 70);

  // Update goals mutation
  const { mutate: updateGoals } = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', '/api/user/1', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/1'] });
      toast({
        title: "Goals updated",
        description: "Your nutrition goals have been saved successfully.",
      });
      navigate('/settings');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateGoals({
      targetCalories: calories,
      proteinTarget: protein,
      carbsTarget: carbs,
      fatTarget: fat
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <button 
          onClick={() => navigate('/settings')}
          className="w-[42px] h-[42px] rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-normal">{t('settings.adjustGoals')}</h1>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6 shadow-lg border">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Daily Calories</Label>
              <div className="space-y-2">
                <Slider
                  value={[calories]}
                  onValueChange={(value) => setCalories(value[0])}
                  max={3000}
                  step={50}
                />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{calories} kcal</span>
                  <span className="text-sm text-gray-500">3000 kcal</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Protein</Label>
              <div className="space-y-2">
                <Slider
                  value={[protein]}
                  onValueChange={(value) => setProtein(value[0])}
                  max={200}
                  step={5}
                />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{protein}g</span>
                  <span className="text-sm text-gray-500">200g</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Carbohydrates</Label>
              <div className="space-y-2">
                <Slider
                  value={[carbs]}
                  onValueChange={(value) => setCarbs(value[0])}
                  max={400}
                  step={5}
                />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{carbs}g</span>
                  <span className="text-sm text-gray-500">400g</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Fat</Label>
              <div className="space-y-2">
                <Slider
                  value={[fat]}
                  onValueChange={(value) => setFat(value[0])}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{fat}g</span>
                  <span className="text-sm text-gray-500">100g</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-black text-white hover:bg-black/90"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}