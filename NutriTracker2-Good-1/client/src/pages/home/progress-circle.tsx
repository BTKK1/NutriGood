import { Progress } from "@/components/ui/progress";
import { calculateProgress } from "@/lib/calories";

interface ProgressCircleProps {
  current: number;
  target: number;
  label: string;
  unit?: string;
}

export default function ProgressCircle({ current, target, label, unit = "g" }: ProgressCircleProps) {
  const progress = calculateProgress(current, target);
  
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-24 h-24 relative">
        <Progress value={progress} className="h-24 w-24 [&>div]:h-24 [&>div]:w-24" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{current}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium">{label}</span>
    </div>
  );
}
