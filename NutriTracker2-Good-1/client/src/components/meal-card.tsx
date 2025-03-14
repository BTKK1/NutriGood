import type { Meal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        {meal.imageUrl && (
          <img 
            src={meal.imageUrl} 
            alt={meal.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-medium">{meal.name}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(meal.consumedAt), "h:mm a")}
          </p>
          <div className="mt-1 text-sm">
            <span className="font-medium">{meal.calories}</span> cal • 
            <span className="ml-2">{meal.protein}g protein</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
