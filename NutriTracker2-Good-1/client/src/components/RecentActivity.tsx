import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Dumbbell, Utensils, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FoodLog, foodTrackingService } from "@/lib/services/foodTracking";
import { ExerciseLog, exerciseTrackingService } from "@/lib/services/exerciseTracking";

type ActivityItem = (FoodLog | ExerciseLog) & { activityType: 'food' | 'exercise' };

export default function RecentActivity() {
  const { firebaseUser } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If user is not authenticated, set loading to false
    if (!firebaseUser) {
      setIsLoading(false);
      return;
    }

    const loadRecentActivity = async () => {
      try {
        setIsLoading(true);
        
        // Get recent food logs
        const recentFood = await foodTrackingService.getRecentFoodLogs(firebaseUser.uid, 7, 5);
        
        // Get recent exercise logs
        const recentExercise = await exerciseTrackingService.getRecentExerciseLogs(firebaseUser.uid, 7, 5);
        
        // Combine and sort by date
        const foodActivities: ActivityItem[] = recentFood.map(food => ({
          ...food,
          activityType: 'food'
        }));
        
        const exerciseActivities: ActivityItem[] = recentExercise.map(exercise => ({
          ...exercise,
          activityType: 'exercise'
        }));
        
        const allActivities = [...foodActivities, ...exerciseActivities].sort((a, b) => {
          const dateA = a.activityType === 'food' ? (a as FoodLog).createdAt.getTime() : (a as ExerciseLog).timestamp.getTime();
          const dateB = b.activityType === 'food' ? (b as FoodLog).createdAt.getTime() : (b as ExerciseLog).timestamp.getTime();
          return dateB - dateA; // Sort descending (most recent first)
        });
        
        setActivities(allActivities.slice(0, 5)); // Take top 5
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecentActivity();
  }, [firebaseUser]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleScanFood = () => {
    window.location.href = "/food/scan";
  };
  
  // Display skeleton/loading state or empty state if no activities
  if (isLoading || activities.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="font-semibold">Recently logged</h2>
        <Card className="p-6 text-center space-y-3 shadow-lg">
          <p className="font-semibold">No recent activity</p>
          <p className="text-sm text-gray-500">
            Your recently logged foods and exercises will appear here.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => window.location.href = "/exercise"}
              className="flex-1 py-3 bg-gray-100 text-black rounded-xl text-sm font-semibold"
            >
              <Dumbbell className="w-5 h-5 mr-2 inline-block" />
              Log Exercise
            </button>
            <button
              onClick={handleScanFood}
              className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-semibold"
            >
              <Camera className="w-5 h-5 mr-2 inline-block" />
              Log Food
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Display actual activity items
  return (
    <div className="space-y-4 p-4">
      <h2 className="font-semibold">Recently logged</h2>
      
      <div className="space-y-3">
        {activities.map((activity, index) => {
          if (activity.activityType === 'food') {
            const foodItem = activity as FoodLog & { activityType: 'food' };
            return (
              <Card key={`food-${index}`} className="p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{foodItem.name}</span>
                      <span className="text-sm text-gray-500">{formatTime(foodItem.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>🔥 {foodItem.calories} cal</span>
                      <span>🥩 {foodItem.protein}g protein</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          } else {
            const exerciseItem = activity as ExerciseLog & { activityType: 'exercise' };
            return (
              <Card key={`exercise-${index}`} className="p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{exerciseItem.exerciseType}</span>
                      <span className="text-sm text-gray-500">{formatTime(exerciseItem.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>🔥 {exerciseItem.caloriesBurned} cal</span>
                      <span>⏱️ {exerciseItem.duration} mins</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          }
        })}
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => window.location.href = "/exercise"}
          className="flex-1 py-3 bg-gray-100 text-black rounded-xl text-sm font-semibold"
        >
          <Dumbbell className="w-5 h-5 mr-2 inline-block" />
          Log Exercise
        </button>
        <button
          onClick={handleScanFood}
          className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-semibold"
        >
          <Camera className="w-5 h-5 mr-2 inline-block" />
          Log Food
        </button>
      </div>
    </div>
  );
}