import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingData } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import {
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiYoutube,
  SiGoogle,
} from "react-icons/si";
import { MdOutlineTv, MdPeople, MdMoreHoriz } from "react-icons/md";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import Graph from "@/assets/images/Graph.png";
import Boxes from "@/assets/images/Boxes.png";
import Wingraph from "@/assets/images/Wingraph.png";
import { saveUserNutritionTargets } from "@/lib/onboardingStorage";
import { useAuth } from "@/contexts/AuthContext";

interface StepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

// Utility function to save data to localStorage
const saveToLocalStorage = (key: string, data: Partial<OnboardingData>) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Utility function to load data from localStorage
const loadFromLocalStorage = (key: string): Partial<OnboardingData> => {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : {};
};

const Header = ({
  title,
  subtitle,
  onBack,
  className = "",
  children,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={`mb-2 ${className}`}>
    <div className="flex items-center">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {children ? children : <h1 className="text-2xl font-bold">{title}</h1>}
    </div>
    {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
  </div>
);

export function SourceStep({ data, onNext, onBack }: StepProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(
    data.source || null,
  );

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.source) {
      setSelectedSource(savedData.source);
    }
  }, []);

  useEffect(() => {
    if (selectedSource) {
      saveToLocalStorage("onboardingData", { ...data, source: selectedSource });
    }
  }, [selectedSource, data]);

  const sources = [
    { icon: SiInstagram, label: "Instagram" },
    { icon: SiFacebook, label: "Facebook" },
    { icon: SiTiktok, label: "TikTok" },
    { icon: SiYoutube, label: "Youtube" },
    { icon: SiGoogle, label: "Google" },
    { icon: MdOutlineTv, label: "TV" },
    { icon: MdPeople, label: "Friend or family" },
    { icon: MdMoreHoriz, label: "Other" },
  ];

  return (
    <div className="space-y-6">
      <Header title="Where did you hear about us?" onBack={onBack} />
      <div className="space-y-2">
        {sources.map((source) => (
          <button
            key={source.label}
            type="button"
            className={`w-full p-4 flex items-center gap-3 rounded-lg border ${
              selectedSource === source.label
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setSelectedSource(source.label)}
          >
            <source.icon className="w-6 h-6" />
            <span className="text-lg">{source.label}</span>
          </button>
        ))}
      </div>
      <Button
        onClick={() => onNext({ ...data, source: selectedSource as string })}
        className="w-full mt-6 bg-black text-white"
        disabled={!selectedSource}
      >
        Next
      </Button>
    </div>
  );
}

export function GenderStep({ data, onNext, onBack }: StepProps) {
  const [selectedGender, setSelectedGender] = useState<string | null>(
    data.gender || null,
  );

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.gender) {
      setSelectedGender(savedData.gender);
    }
  }, []);

  useEffect(() => {
    if (selectedGender) {
      saveToLocalStorage("onboardingData", { ...data, gender: selectedGender });
    }
  }, [selectedGender, data]);

  return (
    <div className="space-y-6">
      <Header
        title="Choose your Gender"
        subtitle="This will be used to calibrate your custom plan."
        onBack={onBack}
      />
      <div className="space-y-2">
        {["Male", "Female"].map((gender) => (
          <button
            key={gender}
            type="button"
            className={`w-full p-4 text-center text-lg rounded-lg border ${
              selectedGender === gender.toLowerCase()
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setSelectedGender(gender.toLowerCase())}
          >
            {gender}
          </button>
        ))}
      </div>
      <Button
        onClick={() =>
          onNext({ ...data, gender: selectedGender as "male" | "female" })
        }
        className="w-full mt-6 bg-black text-white"
        disabled={!selectedGender}
      >
        Next
      </Button>
    </div>
  );
}

export function AgeStep({ data, onNext, onBack }: StepProps) {
  const [age, setAge] = useState<number | null>(data.age || null);

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.age) {
      setAge(savedData.age);
    }
  }, []);

  useEffect(() => {
    if (age) {
      saveToLocalStorage("onboardingData", { ...data, age });
    }
  }, [age, data]);

  const ageOptions = Array.from({ length: 81 }, (_, i) => ({
    value: 10 + i,
    label: `${10 + i} years`,
  }));

  return (
    <div className="space-y-6">
      <Header
        title="What is your age?"
        subtitle="This helps us personalize your nutrition and fitness goals."
        onBack={onBack}
      />

      <div className="border rounded-lg overflow-hidden relative mx-auto max-w-[200px]">
        <ScrollPicker value={age} onChange={setAge} options={ageOptions} />
      </div>

      <Button
        onClick={() => age && onNext({ ...data, age })}
        className="w-full mt-6 bg-black text-white"
        disabled={!age}
      >
        Next
      </Button>
    </div>
  );
}

const ScrollPicker = ({
  value,
  onChange,
  options,
}: {
  value: number | null;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const itemHeight = 50;

  useEffect(() => {
    if (containerRef.current && value !== null) {
      const index = options.findIndex((opt) => opt.value === value);
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [value]);

  const handleScroll = () => {
    if (containerRef.current && !isDragging) {
      const scrollPos = containerRef.current.scrollTop;
      const index = Math.round(scrollPos / itemHeight);
      const newValue = options[index]?.value;
      if (newValue !== undefined) onChange(newValue);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-[250px] overflow-auto snap-y snap-mandatory scrollbar-hide relative"
      onScroll={handleScroll}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <div className="h-[100px]" />
      {options.map((option) => (
        <div
          key={option.value}
          className={`h-[50px] flex items-center justify-center snap-center transition-all duration-200 relative z-10 ${
            value === option.value
              ? "text-black text-3xl font-bold"
              : "text-gray-400 text-xl"
          }`}
        >
          {option.label}
        </div>
      ))}
      <div className="h-[100px]" />
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div className="h-[50px] bg-gray-100/50" />
      </div>
    </div>
  );
};

export function WeightStep({ data, onNext, onBack }: StepProps) {
  const [isMetric, setIsMetric] = useState(true);
  const [height, setHeight] = useState<number | null>(data.height || null);
  const [weight, setWeight] = useState<number | null>(data.weight || null);

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.height) setHeight(savedData.height);
    if (savedData.weight) setWeight(savedData.weight);
  }, []);

  useEffect(() => {
    if (height || weight) {
      saveToLocalStorage("onboardingData", { ...data, height, weight });
    }
  }, [height, weight, data]);

  const cmToFeet = (cm: number): string => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const kgToLbs = (kg: number): number => {
    return Math.round(kg * 2.20462);
  };

  const heightOptions = isMetric
    ? Array.from({ length: 81 }, (_, i) => ({
        value: 150 + i,
        label: `${150 + i} cm`,
      }))
    : Array.from({ length: 81 }, (_, i) => {
        const cmValue = 150 + i;
        return {
          value: cmValue,
          label: cmToFeet(cmValue),
        };
      });

  const weightOptions = isMetric
    ? Array.from({ length: 150 }, (_, i) => ({
        value: 40 + i,
        label: `${40 + i} kg`,
      }))
    : Array.from({ length: 150 }, (_, i) => {
        const kgValue = 40 + i;
        return {
          value: kgValue,
          label: `${kgToLbs(kgValue)} lbs`,
        };
      });

  return (
    <div className="space-y-6">
      <Header
        title="Height & weight"
        subtitle="This will be used to calibrate your custom plan."
        onBack={onBack}
      />

      <div className="flex items-center justify-between mb-8">
        <span className={isMetric ? "text-gray-400" : "text-black"}>
          Imperial
        </span>
        <div
          className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer"
          onClick={() => {
            setIsMetric(!isMetric);
            setHeight(height);
            setWeight(weight);
          }}
        >
          <div
            className={`w-5 h-5 bg-black rounded-full absolute top-0.5 transition-all ${
              isMetric ? "left-6" : "left-0.5"
            }`}
          />
        </div>
        <span className={isMetric ? "text-black" : "text-gray-400"}>
          Metric
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-2">Height</div>
          <div className="border rounded-lg overflow-hidden relative">
            <ScrollPicker
              value={height}
              onChange={setHeight}
              options={heightOptions}
            />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Weight</div>
          <div className="border rounded-lg overflow-hidden relative">
            <ScrollPicker
              value={weight}
              onChange={setWeight}
              options={weightOptions}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          if (height && weight) {
            onNext({ ...data, height, weight });
          }
        }}
        className="w-full mt-6 bg-black text-white"
        disabled={!height || !weight}
      >
        Next
      </Button>
    </div>
  );
}

export function GoalSpeedStep({ data, onNext, onBack }: StepProps) {
  const [speed, setSpeed] = useState<number | null>(data.goalSpeed || null);

  useEffect(() => {
    console.log("GoalSpeedStep received data:", data); // Debug log
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.goalSpeed) {
      setSpeed(savedData.goalSpeed);
    }
  }, [data]);

  useEffect(() => {
    if (speed) {
      saveToLocalStorage("onboardingData", { ...data, goalSpeed: speed });
    }
  }, [speed, data]);

  const isGaining = data.goalType === "gain";

  return (
    <div className="space-y-6">
      <Header
        title={`How fast do you want to ${isGaining ? "gain" : "lose"} weight?`}
        onBack={onBack}
      />

      <div className="mt-16">
        <div className="text-center mb-16">
          <div className="text-base font-medium text-gray-600">
            {isGaining
              ? "Weight gain speed per week"
              : "Weight loss speed per week"}
          </div>
          <div className="text-[64px] font-semibold mt-2">
            {speed?.toFixed(1) || "0.0"} kg
          </div>
        </div>

        <div className="px-4">
          <div className="relative">
            <input
              type="range"
              min={0.1}
              max={1.5}
              step={0.1}
              value={speed || 0.1}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">{isGaining ? "🌱" : "🐢"}</span>
                <span className="text-sm">0.1kg</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">{isGaining ? "💪" : "🦊"}</span>
                <span className="text-sm">0.8kg</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">
                  {isGaining ? "🏋️" : "⚡️"}
                </span>
                <span className="text-sm">1.5kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mx-4">
          <div className="bg-gray-50 rounded-xl py-4">
            <div className="text-center font-medium">Recommended</div>
            <div className="text-center text-sm text-gray-600 mt-1">
              {isGaining
                ? "Steady gains are more sustainable and help build lean muscle"
                : "Steady weight loss is more sustainable and helps maintain muscle"}
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => onNext({ ...data, goalSpeed: speed || undefined })}
        className="w-full mt-6 bg-black text-white"
        disabled={speed === null}
      >
        Next
      </Button>
    </div>
  );
}

export function LongTermResultsStep({ data, onNext, onBack }: StepProps) {
  useEffect(() => {
    saveToLocalStorage("onboardingData", data);
  }, [data]);

  return (
    <div className="space-y-6">
      <Header title="Saraat AI creates long-term results" onBack={onBack} />

      <div
        className="bg-gray-50 rounded-xl overflow-hidden"
        style={{ maxHeight: "475px" }}
      >
        <div className="relative aspect-[4/3] w-full p-1">
          <img
            src={Graph}
            alt="Weight Loss Progress Graph"
            className="w-full h-full object-contain"
            style={{ transform: "scale(1.05)", transformOrigin: "center" }}
          />

          <div className="absolute left-4 top-4">
            <div className="bg-white p-2 rounded-lg shadow-sm text-center">
              <div className="text-sm font-medium">Your Weight</div>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xl font-bold text-gray-600">
            <span>Month 1</span>
            <span>Month 6</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <span className="text-sm">Saraat AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Traditional Diet</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            80% of Saraat AI users maintain their weight loss even 6 months
            later
          </p>
        </div>
      </div>

      <Button
        onClick={() => onNext({ ...data })}
        className="w-full bg-black text-white"
      >
        Next
      </Button>
    </div>
  );
}

export function ResultsStep({ data, onNext, onBack }: StepProps) {
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    saveToLocalStorage("onboardingData", data);
  }, [data]);

  return (
    <div className="space-y-6">
      <Header
        title="Lose twice as much weight with Saraat AI vs on your own"
        onBack={onBack}
      />

      <div className="overflow-hidden">
        <div className="relative aspect-[3/2] w-full p-2">
          <img
            src={Boxes}
            alt="Weight Loss Comparison Boxes"
            className="w-full h-full object-contain"
            style={{ transform: "scale(1.15)", transformOrigin: "center" }}
          />

          <div
            style={{ left: "140px", top: "70px" }}
            className="absolute text-center"
          >
            <div className="font-bold text-black">
              <div className="text-sm">Without</div>
              <div className="text-sm">Saraat AI</div>
            </div>
          </div>
          <div
            style={{ left: "160px", top: "215px" }}
            className="absolute text-center"
          >
            <div className="font-bold text-black text-sm">20%</div>
          </div>

          <div
            style={{ left: "255px", top: "70px" }}
            className="absolute text-center"
          >
            <div className="font-bold text-black">
              <div className="text-sm">With</div>
              <div className="text-sm">Saraat AI</div>
            </div>
          </div>
          <div
            style={{ left: "280px", top: "215px" }}
            className="absolute text-center"
          >
            <div className="font-bold text-white text-sm">4X</div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-center text-sm text-gray-600">
            Saraat AI makes it easy and holds you accountable.
          </p>
        </div>
      </div>

      <Button
        onClick={() => {
          setHasViewed(true);
          onNext({ ...data });
        }}
        className="w-full bg-black text-white"
        disabled={hasViewed}
      >
        Next
      </Button>
    </div>
  );
}

export function WorkoutsStep({ data, onNext, onBack }: StepProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<number | null>(
    data.workoutsPerWeek || null,
  );

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.workoutsPerWeek) {
      setSelectedWorkout(savedData.workoutsPerWeek);
    }
  }, []);

  useEffect(() => {
    if (selectedWorkout) {
      saveToLocalStorage("onboardingData", {
        ...data,
        workoutsPerWeek: selectedWorkout,
      });
    }
  }, [selectedWorkout, data]);

  const options = [
    {
      value: 1,
      label: "0-2",
      description: "Workouts now and then",
      emoji: "🌱",
    },
    {
      value: 4,
      label: "3-5",
      description: "A few workouts per week",
      emoji: "💪",
    },
    { value: 6, label: "6+", description: "Dedicated athlete", emoji: "🏃" },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="How many workouts do you do per week?"
        subtitle="This will be used to calibrate your custom plan."
        onBack={onBack}
      />
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`w-full p-4 text-left rounded-lg border ${
              selectedWorkout === option.value
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setSelectedWorkout(option.value)}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{option.emoji}</span>
              <div>
                <div className="text-lg">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <Button
        onClick={() =>
          onNext({ ...data, workoutsPerWeek: selectedWorkout as number })
        }
        className="w-full mt-6 bg-black text-white"
        disabled={!selectedWorkout}
      >
        Next
      </Button>
    </div>
  );
}

export function ExperienceStep({ data, onNext, onBack }: StepProps) {
  const [selectedExperience, setSelectedExperience] = useState<
    "beginner" | "advanced" | null
  >(data.experience || null);

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.experience) {
      setSelectedExperience(savedData.experience);
    }
  }, []);

  useEffect(() => {
    if (selectedExperience) {
      saveToLocalStorage("onboardingData", {
        ...data,
        experience: selectedExperience,
      });
    }
  }, [selectedExperience, data]);

  return (
    <div className="space-y-6">
      <Header
        title="Have you tried other calorie tracking apps?"
        onBack={onBack}
      />
      <div className="space-y-2">
        <button
          type="button"
          className={`w-full p-4 flex items-center gap-3 rounded-lg border ${
            selectedExperience === "beginner"
              ? "bg-black text-white"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => setSelectedExperience("beginner")}
        >
          <span className="text-lg">👎 No</span>
        </button>
        <button
          type="button"
          className={`w-full p-4 flex items-center gap-3 rounded-lg border ${
            selectedExperience === "advanced"
              ? "bg-black text-white"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => setSelectedExperience("advanced")}
        >
          <span className="text-lg">👍 Yes</span>
        </button>
      </div>
      <Button
        onClick={() =>
          onNext({
            ...data,
            experience: selectedExperience as "beginner" | "advanced",
          })
        }
        className="w-full mt-6 bg-black text-white"
        disabled={!selectedExperience}
      >
        Next
      </Button>
    </div>
  );
}

export function GoalTypeStep({ data, onNext, onBack }: StepProps) {
  const [selectedGoalType, setSelectedGoalType] = useState<
    "lose" | "maintain" | "gain" | null
  >(data.goalType || null);

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.goalType) {
      setSelectedGoalType(savedData.goalType);
    }
  }, []);

  useEffect(() => {
    if (selectedGoalType) {
      saveToLocalStorage("onboardingData", {
        ...data,
        goalType: selectedGoalType,
      });
    }
  }, [selectedGoalType, data]);

  return (
    <div className="space-y-6">
      <Header
        title="What is your primary goal?"
        subtitle="This helps us personalize your plan."
        onBack={onBack}
      />

      <div className="space-y-2">
        {[
          {
            value: "lose",
            label: "Lose Weight",
            description:
              "I want to shed some pounds and improve my body composition",
          },
          {
            value: "maintain",
            label: "Maintain Weight",
            description: "I want to keep my current weight and stay healthy",
          },
          {
            value: "gain",
            label: "Gain Muscle",
            description: "I want to build strength and increase muscle mass",
          },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            className={`w-full p-4 text-left rounded-lg border ${
              selectedGoalType === option.value
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() =>
              setSelectedGoalType(option.value as "lose" | "maintain" | "gain")
            }
          >
            <div className="text-lg">{option.label}</div>
            <div className="text-sm opacity-70">{option.description}</div>
          </button>
        ))}
      </div>

      <Button
        onClick={() =>
          onNext({
            ...data,
            goalType: selectedGoalType as "lose" | "maintain" | "gain",
          })
        }
        className={`w-full mt-6 ${
          !selectedGoalType
            ? "bg-gray-400 text-gray-600"
            : "bg-black text-white"
        }`}
        disabled={!selectedGoalType}
      >
        Next
      </Button>
    </div>
  );
}

export function BarriersStep({ data, onNext, onBack }: StepProps) {
  type BarrierOption =
    | "lack of consistency"
    | "unhealthy eating habits"
    | "lack of support"
    | "busy schedule"
    | "lack of meal inspiration";
  const [selectedBarriers, setSelectedBarriers] = useState<BarrierOption[]>(
    data.barriers || [],
  );

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.barriers) {
      setSelectedBarriers(savedData.barriers);
    }
  }, []);

  useEffect(() => {
    if (selectedBarriers.length > 0) {
      saveToLocalStorage("onboardingData", {
        ...data,
        barriers: selectedBarriers,
      });
    }
  }, [selectedBarriers, data]);

  const barriers: Array<{ value: BarrierOption; label: string; icon: string }> =
    [
      {
        value: "lack of consistency",
        label: "Lack of consistency",
        icon: "📊",
      },
      {
        value: "unhealthy eating habits",
        label: "Unhealthy eating habits",
        icon: "🍔",
      },
      { value: "lack of support", label: "Lack of support", icon: "👥" },
      { value: "busy schedule", label: "Busy schedule", icon: "📅" },
      {
        value: "lack of meal inspiration",
        label: "Lack of meal inspiration",
        icon: "🥗",
      },
    ];

  return (
    <div className="space-y-6">
      <Header
        title="What are your biggest barriers to success?"
        subtitle="Select all that apply. This helps us prepare for challenges."
        onBack={onBack}
      />

      <div className="space-y-2">
        {barriers.map((barrier) => (
          <button
            key={barrier.value}
            type="button"
            className={`w-full p-4 flex items-center gap-3 rounded-lg border ${
              selectedBarriers.includes(barrier.value)
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => {
              if (selectedBarriers.includes(barrier.value)) {
                setSelectedBarriers(
                  selectedBarriers.filter((b) => b !== barrier.value),
                );
              } else {
                setSelectedBarriers([...selectedBarriers, barrier.value]);
              }
            }}
          >
            <span className="text-2xl">{barrier.icon}</span>
            <span className="text-lg">{barrier.label}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={() => {
          if (selectedBarriers.length > 0) {
            onNext({ ...data, barriers: selectedBarriers });
          }
        }}
        className={`w-full mt-6 ${
          selectedBarriers.length === 0
            ? "bg-gray-400 text-gray-600"
            : "bg-black text-white"
        }`}
        disabled={selectedBarriers.length === 0}
      >
        Next
      </Button>
    </div>
  );
}

export function DietTypeStep({ data, onNext, onBack }: StepProps) {
  const [selectedDietType, setSelectedDietType] = useState<
    "classic" | "pescatarian" | "vegetarian" | "vegan" | null
  >(data.dietType || null);

  useEffect(() => {
    const savedData = loadFromLocalStorage("onboardingData");
    if (savedData.dietType) {
      setSelectedDietType(savedData.dietType);
    }
  }, []);

  useEffect(() => {
    if (selectedDietType) {
      saveToLocalStorage("onboardingData", {
        ...data,
        dietType: selectedDietType,
      });
    }
  }, [selectedDietType, data]);

  const diets: Array<{
    value: "classic" | "pescatarian" | "vegetarian" | "vegan";
    label: string;
    icon: string;
  }> = [
    { value: "classic", label: "Classic", icon: "🍽️" },
    { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
    { value: "vegetarian", label: "Vegetarian", icon: "🥗" },
    { value: "vegan", label: "Vegan", icon: "🌱" },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="What type of diet do you prefer?"
        subtitle="This helps us customize your meal recommendations."
        onBack={onBack}
      />

      <div className="space-y-2">
        {diets.map((diet) => (
          <button
            key={diet.value}
            type="button"
            className={`w-full p-4 flex items-center gap-3 rounded-lg border ${
              selectedDietType === diet.value
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setSelectedDietType(diet.value)}
          >
            <span className="text-2xl">{diet.icon}</span>
            <span className="text-lg">{diet.label}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={() =>
          onNext({
            ...data,
            dietType: selectedDietType as
              | "classic"
              | "pescatarian"
              | "vegetarian"
              | "vegan",
          })
        }
        className={`w-full mt-6 ${
          !selectedDietType
            ? "bg-gray-400 text-gray-600"
            : "bg-black text-white"
        }`}
        disabled={!selectedDietType}
      >
        Next
      </Button>
    </div>
  );
}

export function RecommendationsStep({ data, onNext, onBack }: StepProps) {
  const { user } = useAuth();
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    saveToLocalStorage("onboardingData", data);
  }, [data]);

  const recommendations = {
    nutritionPlan: "A balanced diet customized for your maintain goals",
    exerciseRoutine: "3 workouts per week focusing on strength and cardio",
    progressTracking:
      "Weekly check-ins to monitor your progress and adjust as needed",
  };

  useEffect(() => {
    if (user && !hasViewed) {
      console.log("Recommendations loaded for user:", user.uid);
    }
  }, [user, hasViewed]);

  return (
    <div className="space-y-6">
      <Header
        title="Your Personalized Recommendations"
        subtitle="Based on your profile, here's what we recommend for your success"
        onBack={onBack}
      />

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="text-lg font-medium">Nutrition Plan</div>
          <div className="text-sm text-gray-600">
            {recommendations.nutritionPlan}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="text-lg font-medium">Exercise Routine</div>
          <div className="text-sm text-gray-600">
            {recommendations.exerciseRoutine}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="text-lg font-medium">Progress Tracking</div>
          <div className="text-sm text-gray-600">
            {recommendations.progressTracking}
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          setHasViewed(true);
          onNext({ ...data });
        }}
        className="w-full bg-black text-white"
        disabled={hasViewed}
      >
        Continue
      </Button>
    </div>
  );
}

export function YourFitnessJourneyStep({ data, onNext, onBack }: StepProps) {
  useEffect(() => {
    saveToLocalStorage("onboardingData", data);
  }, [data]);

  return (
    <div className="space-y-6">
      <Header
        title="Your Fitness Journey"
        subtitle="We've created a personalized plan to help you achieve your goals"
        onBack={onBack}
      />

      <div className="space-y-4">
        <div className="p-4 bg-black text-white rounded-lg">
          <div className="text-lg font-medium">YOUR CURRENT WEIGHT</div>
          <div className="text-3xl font-bold">{data.weight || "N/A"} kg</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-sm font-medium">GENDER</div>
            <div className="text-lg">{data.gender || "N/A"}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-sm font-medium">AGE</div>
            <div className="text-lg">
              {data.age ? `${data.age} years` : "N/A"}
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm font-medium">YOUR GOAL</div>
          <div className="text-lg">{data.goalType || "N/A"}</div>
        </div>
      </div>

      <Button
        onClick={() => onNext({ ...data })}
        className="w-full bg-black text-white"
      >
        Next
      </Button>
    </div>
  );
}

export function CompletingOnboardingStep({ data, onNext }: StepProps) {
  useEffect(() => {
    // Clear localStorage after onboarding completes
    localStorage.removeItem("onboardingData");

    // Simulate a delay for the "Completing Onboarding" screen (e.g., 2 seconds)
    const timer = setTimeout(() => {
      onNext({ ...data }); // Proceed to final navigation
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [data, onNext]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <h1 className="text-2xl font-bold">Completing Onboarding...</h1>
      <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      <p className="text-gray-600">Setting up your personalized plan!</p>
    </div>
  );
}
