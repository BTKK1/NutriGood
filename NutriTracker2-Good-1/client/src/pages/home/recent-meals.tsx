import { useQuery } from "@tanstack/react-query";
import type { Meal } from "@shared/schema";
import MealCard from "@/components/meal-card";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentMealsProps {
  userId: string | number | undefined;
}

export default function RecentMeals({ userId }: RecentMealsProps) {
  const { data: meals, isLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals", userId],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Meals</h2>
      {meals?.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
}
