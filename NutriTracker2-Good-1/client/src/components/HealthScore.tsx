import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { calculateHealthScore } from "@/lib/health-calculations";
import { getUserNutritionTargets } from "@/lib/onboardingStorage";

export default function HealthScore() {
  const { firebaseUser } = useAuth();
  const [healthScore, setHealthScore] = useState(7);
  const [progressValue, setProgressValue] = useState(70);

  useEffect(() => {
    if (!firebaseUser) return;

    // Load health data and calculate score (silently in the background)
    const loadHealthScore = async () => {
      try {
        // Get user data from localStorage first
        const storedTargets = getUserNutritionTargets(firebaseUser.uid);
        
        if (storedTargets && storedTargets.healthScore) {
          setHealthScore(storedTargets.healthScore);
          setProgressValue(storedTargets.healthScore * 10); // Convert to percentage (0-100)
        } else {
          // Try to fetch from Firestore
          try {
            const { getUserDocument } = await import('@/lib/firebase');
            const userDoc = await getUserDocument(firebaseUser.uid);
            
            if (userDoc) {
              // Calculate health score from user data
              const calculatedScore = calculateHealthScore({
                workoutsPerWeek: userDoc.workoutsPerWeek || 3,
                goalType: userDoc.goalType as any,
                dietType: userDoc.dietType as any,
                experience: userDoc.experience as any,
                barriers: userDoc.barriers
              });
              
              setHealthScore(calculatedScore);
              setProgressValue(calculatedScore * 10); // Convert to percentage (0-100)
            }
          } catch (e) {
            console.warn("Could not fetch user data from Firestore:", e);
          }
        }
      } catch (error) {
        console.error("Error loading health score:", error);
      }
    };
    
    loadHealthScore();
  }, [firebaseUser]);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Back Button */}
      <Button variant="ghost" size="icon" className="mb-6">
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Health Score Card */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span role="img" aria-label="heart" className="text-2xl text-rose-500">❤️</span>
          <h2 className="text-xl font-semibold">Health Score</h2>
        </div>
        <Progress value={progressValue} className="bg-gray-100" />
        <div className="mt-2 text-right text-sm text-gray-600">{healthScore}/10</div>
      </Card>

      {/* Goals Section */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold">How to reach your goals:</h2>

        <Card className="p-4 flex items-center gap-3">
          <span role="img" aria-label="heart" className="text-2xl">❤️</span>
          <span>Use health scores to improve your routine</span>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <span role="img" aria-label="avocado" className="text-2xl">🥑</span>
          <span>Track your food</span>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <span role="img" aria-label="fire" className="text-2xl">⭕</span>
          <span>Follow your daily calorie recommendation</span>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex gap-1">
            <span role="img" aria-label="bread" className="text-xl">🍞</span>
            <span role="img" aria-label="lightning" className="text-xl">⚡</span>
            <span role="img" aria-label="droplet" className="text-xl">💧</span>
          </div>
          <span>Balance your carbs, proteins, and fat</span>
        </Card>
      </div>

      {/* Sources Section */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Plan based on the following sources, among other peer-reviewed medical studies:
        </p>
        <ul className="text-sm space-y-1 list-disc pl-5 text-gray-600">
          <li>Basal metabolic rate</li>
          <li>Calorie counting – Harvard</li>
          <li>International Society of Sports Nutrition</li>
          <li>National Institutes of Health</li>
        </ul>
      </div>

      {/* Action Button */}
      <Button 
        className="w-full mt-8 bg-black text-white py-6 text-lg font-medium"
        onClick={() => {/* Handle navigation */}}
      >
        Let's get started!
      </Button>
    </div>
  );
}