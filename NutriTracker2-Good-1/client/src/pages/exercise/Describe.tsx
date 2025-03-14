import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, MoreVertical, Sparkles } from "lucide-react";
import { analyzeExercise } from "@/lib/services/openai";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { saveExercise } from "@/lib/services/exercises";
import { useAuth } from "@/contexts/AuthContext";
import { exerciseTrackingService } from "@/lib/services/exerciseTracking";

export default function DescribeExercisePage() {
  const [description, setDescription] = useState("Stair climbing for 25 mins, thighs burning");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { firebaseUser, user } = useAuth();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please describe your exercise",
        variant: "destructive"
      });
      return;
    }

    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "Please login to log exercises",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeExercise(description);
      
      // Extract duration from description (e.g., "25 mins" -> 25)
      const durationMatch = description.match(/(\d+)\s*min/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 30; // default to 30 mins
      
      // Calculate calories burned using our exercise service
      const caloriesBurned = exerciseTrackingService.calculateCaloriesBurned(
        analysis.exerciseType || 'Exercise',
        duration,
        analysis.intensityLevel || 'medium',
        user?.weight || 70 // Use user's weight if available
      );
      
      // Log exercise with new service
      await exerciseTrackingService.logExercise(firebaseUser.uid, {
        exerciseType: analysis.exerciseType || 'Exercise',
        description,
        duration,
        intensity: analysis.intensityLevel || 'medium',
        caloriesBurned,
        caloriesPerMinute: analysis.caloriesPerMinute || Math.round(caloriesBurned / duration),
        icon: analysis.icon || exerciseTrackingService.getExerciseIcon(analysis.exerciseType || 'Exercise')
      });

      // For backward compatibility, also use the old service
      await saveExercise(firebaseUser.uid, {
        ...analysis,
        exerciseType: analysis.exerciseType || 'Exercise',
        intensityLevel: analysis.intensityLevel || 'medium',
        icon: analysis.icon || '🏃‍♂️',
        totalCalories: caloriesBurned,
        description
      });

      toast({
        title: "Success",
        description: "Exercise logged successfully!",
      });
      navigate('/home');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze exercise. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/exercise">
          <button className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-[17px]">Describe Exercise</h1>
        <button className="w-[42px] h-[42px] flex items-center justify-center">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-[46px] px-4 border-2 border-black rounded-[14px] text-[17px] font-normal tracking-[-0.2px] caret-[2px] focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
          <Sparkles className="w-4 h-4" />
          <span className="text-[13px]">Created by AI</span>
        </div>

        <div className="bg-gray-100 rounded-[20px] p-4">
          <span className="text-gray-500">Example: </span>
          <span>Stair climbing for 25 mins, thighs burning</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Button 
          className="w-full bg-black text-white rounded-[14px] h-[52px] text-[15px] font-medium disabled:opacity-50 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.4)] transition-all duration-300"
          disabled={isLoading || !description.trim()}
          onClick={handleSubmit}
        >
          {isLoading ? "Analyzing..." : "Submit Exercise"}
        </Button>
      </div>
    </div>
  );
}