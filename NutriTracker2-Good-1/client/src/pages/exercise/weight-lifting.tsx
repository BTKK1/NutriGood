import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { exerciseTrackingService } from "@/lib/services/exerciseTracking";
import { toast } from "@/hooks/use-toast";

export default function WeightLiftingPage() {
  const [duration, setDuration] = useState("15");
  const [intensity, setIntensity] = useState(1); // 0 = Low, 1 = Medium, 2 = High
  const [isLogging, setIsLogging] = useState(false);
  const { firebaseUser } = useAuth();
  const [_, setLocation] = useLocation();

  const handleIntensityClick = (section: number) => {
    setIntensity(section);
  };

  const getIntensityLevel = () => {
    switch (intensity) {
      case 2: return 'high';
      case 1: return 'medium';
      case 0: return 'low';
      default: return 'medium';
    }
  };

  const handleLogExercise = async () => {
    if (!firebaseUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to log your exercise",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLogging(true);
      
      const intensityLevel = getIntensityLevel();
      const durationMinutes = parseInt(duration) || 15; // Fallback to 15 if invalid
      
      // Calculate calories burned based on intensity and duration
      const caloriesPerMinute = intensity === 2 ? 10 : intensity === 1 ? 7 : 4;
      const totalCalories = caloriesPerMinute * durationMinutes;

      await exerciseTrackingService.logExercise(firebaseUser.uid, {
        exerciseType: "Weight lifting",
        description: `Weight lifting - ${intensityLevel} intensity for ${durationMinutes} minutes`,
        duration: durationMinutes,
        intensity: intensityLevel,
        caloriesBurned: totalCalories,
        caloriesPerMinute,
        icon: '🏋️‍♂️'
      });

      toast({
        title: "Exercise logged",
        description: "Your weight lifting session has been recorded",
      });

      // Navigate back to home page
      setLocation('/');
    } catch (error) {
      console.error("Error logging exercise:", error);
      toast({
        title: "Failed to log exercise",
        description: "There was an error recording your exercise",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <Link href="/exercise">
          <button className="w-[42px] h-[42px] rounded-full bg-gray-50 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <div className="ml-3 flex items-center gap-2">
          <Dumbbell className="w-6 h-6" />
          <span className="text-[17px]">Weight lifting</span>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-8">
        {/* Intensity Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">✨</span>
            <span className="text-[15px] font-medium">Set intensity</span>
          </div>

          <div className="bg-gray-50 rounded-[20px] px-4 py-4">
            <div className="flex justify-between relative pr-8">
              <div className="flex-1 space-y-8">
                <div
                  onClick={() => handleIntensityClick(2)}
                  className="cursor-pointer"
                >
                  <div
                    className={intensity === 2 ? "text-black" : "text-gray-400"}
                  >
                    <p className="text-[15px] font-medium">High</p>
                    <p className="text-[13px]">
                      Training to failure, breathing heavily
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleIntensityClick(1)}
                  className="cursor-pointer"
                >
                  <div
                    className={intensity === 1 ? "text-black" : "text-gray-400"}
                  >
                    <p className="text-[15px] font-medium">Medium</p>
                    <p className="text-[13px]">Breaking a sweat, many reps</p>
                  </div>
                </div>

                <div
                  onClick={() => handleIntensityClick(0)}
                  className="cursor-pointer"
                >
                  <div
                    className={intensity === 0 ? "text-black" : "text-gray-400"}
                  >
                    <p className="text-[15px] font-medium">Low</p>
                    <p className="text-[13px]">
                      Not breaking a sweat, giving little effort
                    </p>
                  </div>
                </div>
              </div>

              {/* Intensity Bar */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-black rounded-full">
                <div
                  className="absolute w-3 h-3 bg-black rounded-full -left-1 transition-transform duration-300 ease-in-out"
                  style={{
                    top:
                      intensity === 2 ? "0%" : intensity === 1 ? "50%" : "100%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duration Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">⏱️</span>
            <span className="text-[15px] font-medium">Duration</span>
          </div>

          <div className="flex gap-2">
            {["15", "30", "60", "90"].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`h-[34px] px-4 rounded-full text-[13px] font-medium
                  ${duration === mins ? "bg-black text-white" : "bg-gray-100"}`}
              >
                {mins} mins
              </button>
            ))}
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full h-[46px] px-4 border rounded-[14px] text-[15px]"
          />
        </div>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <button 
          onClick={handleLogExercise}
          disabled={isLogging}
          className={`w-full bg-black text-white rounded-[14px] h-[52px] text-[15px] font-medium ${isLogging ? 'opacity-70' : ''}`}
        >
          {isLogging ? "Logging..." : "Add"}
        </button>
      </div>
    </div>
  );
}
