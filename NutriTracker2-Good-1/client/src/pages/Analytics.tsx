import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog";
import NavBar from "@/components/ui/nav-bar";
import { Trophy, Scale, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Analytics() {
  const [activeTimeRange, setActiveTimeRange] = useState("90 Days");
  const [activeNutritionRange, setActiveNutritionRange] = useState("This week");
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showGoalWeightModal, setShowGoalWeightModal] = useState(false);
  const [weight, setWeight] = useState(118);
  const [goalWeight, setGoalWeight] = useState(118);
  const [isMetric, setIsMetric] = useState(false);
  const [tempWeight, setTempWeight] = useState(weight);
  const [tempGoalWeight, setTempGoalWeight] = useState(goalWeight);
  const weightPickerRef = useRef<HTMLDivElement>(null);
  const goalWeightPickerRef = useRef<HTMLDivElement>(null);

  // Convert between metric and imperial
  const toMetric = (lbs: number) => Math.round(lbs * 0.45359237);
  const toImperial = (kg: number) => Math.round(kg * 2.20462262);

  // Generate weight options based on unit system
  const getWeightOptions = () => {
    if (isMetric) {
      return Array.from({ length: 200 }, (_, i) => ({
        value: (20 + i).toString(),
        label: `${20 + i} kg`,
      }));
    }
    return Array.from({ length: 300 }, (_, i) => ({
        value: (50 + i).toString(),
        label: `${50 + i} lbs`,
    }));
  };

  const weightOptions = getWeightOptions();

  // Reset tempWeight when modal opens/closes
  useEffect(() => {
    if (showWeightModal) {
      const currentValue = isMetric ? toMetric(weight) : weight;
      setTempWeight(currentValue);
    }
  }, [showWeightModal, weight, isMetric]);

  // Reset tempGoalWeight when modal opens/closes
  useEffect(() => {
    if (showGoalWeightModal) {
      const currentValue = isMetric ? toMetric(goalWeight) : goalWeight;
      setTempGoalWeight(currentValue);
    }
  }, [showGoalWeightModal, goalWeight, isMetric]);

  // Initialize scroll position and selection for weight modal
  useEffect(() => {
    if (showWeightModal && weightPickerRef.current && tempWeight) {
      const index = weightOptions.findIndex(opt => parseInt(opt.value) === tempWeight);
      if (index !== -1) {
        weightPickerRef.current.scrollTop = index * 50;
        
        // Force update the visual selection state
        setTimeout(() => {
          const items = weightPickerRef.current?.getElementsByClassName('wheel-picker-item');
          if (items) {
            Array.from(items).forEach(item => {
              item.classList.remove('wheel-picker-selected');
            });
            if (items[index]) {
              items[index].classList.add('wheel-picker-selected');
            }
          }
        }, 50);
      }
    }
  }, [showWeightModal, isMetric, weightOptions, tempWeight]);

  // Initialize scroll position and selection for goal weight modal
  useEffect(() => {
    if (showGoalWeightModal && goalWeightPickerRef.current && tempGoalWeight) {
      const index = weightOptions.findIndex(opt => parseInt(opt.value) === tempGoalWeight);
      if (index !== -1) {
        goalWeightPickerRef.current.scrollTop = index * 50;
        
        // Force update the visual selection state
        setTimeout(() => {
          const items = goalWeightPickerRef.current?.getElementsByClassName('wheel-picker-item');
          if (items) {
            Array.from(items).forEach(item => {
              item.classList.remove('wheel-picker-selected');
            });
            if (items[index]) {
              items[index].classList.add('wheel-picker-selected');
            }
          }
        }, 50);
      }
    }
  }, [showGoalWeightModal, isMetric, weightOptions, tempGoalWeight]);

  // Weight picker scroll handlers
  useEffect(() => {
    const picker = weightPickerRef.current;
    if (!picker) return;

    const handleScroll = () => {
      const itemHeight = 50;
      const scrollTop = picker.scrollTop;
      const selectedIndex = Math.round(scrollTop / itemHeight);

      const items = picker.getElementsByClassName('wheel-picker-item');
      Array.from(items).forEach(item => {
        item.classList.remove('wheel-picker-selected');
      });

      if (items[selectedIndex]) {
        items[selectedIndex].classList.add('wheel-picker-selected');
      }

      const value = weightOptions[selectedIndex]?.value;
      if (value) {
        setTempWeight(parseInt(value));
      }
    };

    picker.addEventListener("scroll", handleScroll);
    return () => picker.removeEventListener("scroll", handleScroll);
  }, [weightOptions]);

  // Goal weight picker scroll handlers
  useEffect(() => {
    const picker = goalWeightPickerRef.current;
    if (!picker) return;

    const handleScroll = () => {
      const itemHeight = 50;
      const scrollTop = picker.scrollTop;
      const selectedIndex = Math.round(scrollTop / itemHeight);

      const items = picker.getElementsByClassName('wheel-picker-item');
      Array.from(items).forEach(item => {
        item.classList.remove('wheel-picker-selected');
      });

      if (items[selectedIndex]) {
        items[selectedIndex].classList.add('wheel-picker-selected');
      }

      const value = weightOptions[selectedIndex]?.value;
      if (value) {
        setTempGoalWeight(parseInt(value));
      }
    };

    picker.addEventListener("scroll", handleScroll);
    return () => picker.removeEventListener("scroll", handleScroll);
  }, [weightOptions]);

  const timeRanges = ["90 Days", "6 Months", "1 Year", "All time"];
  const nutritionRanges = ["This week", "Last week", "2 wks. ago", "3 wks. ago"];

  const handleSaveWeight = () => {
    const newWeight = isMetric ? toImperial(tempWeight) : tempWeight;
    setWeight(newWeight);
    setShowWeightModal(false);
  };

  const handleSaveGoalWeight = () => {
    const newGoalWeight = isMetric ? toImperial(tempGoalWeight) : tempGoalWeight;
    setGoalWeight(newGoalWeight);
    setShowGoalWeightModal(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Goal Weight Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <h2 className="text-lg font-bold">Goal Weight {goalWeight} lbs</h2>
        </div>
        <Button 
          variant="secondary" 
          className="bg-black text-white px-6 hover:bg-black/90"
          onClick={() => setShowGoalWeightModal(true)}
        >
          Update
        </Button>
      </div>

      {/* Current Weight Card */}
      <Card className="p-4 space-y-2 shadow-lg">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          <h3 className="text-lg font-bold">Current Weight {weight} lbs</h3>
        </div>
        <p className="text-sm text-gray-500">
          Remember to update this at least once a week so we can adjust your plan to hit your goal
        </p>
        <Button 
          variant="secondary" 
          className="w-full bg-black text-white hover:bg-black/90"
          onClick={() => setShowWeightModal(true)}
        >
          Update your weight
        </Button>
      </Card>

      {/* BMI Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your BMI</h3>
        <div className="flex justify-between items-center">
          <div>
            <p>Your weight is <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Underweight</span></p>
            <p className="text-2xl font-bold">12.0</p>
          </div>
          <button className="text-gray-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full" />
          <div className="absolute h-4 w-2 bg-black -top-1 left-[20%]" />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Underweight</span>
          <span>Healthy</span>
          <span>Overweight</span>
          <span>Obese</span>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Goal Progress</h3>
          <span className="text-gray-500">100% Goal achieved</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {timeRanges.map(range => (
            <Button
              key={range}
              variant={activeTimeRange === range ? "secondary" : "ghost"}
              className={activeTimeRange === range ? "bg-gray-100" : ""}
              onClick={() => setActiveTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
        <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="h-px w-full bg-black"></div>
        </div>
      </div>

      {/* Nutrition Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Nutrition</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {nutritionRanges.map(range => (
            <Button
              key={range}
              variant={activeNutritionRange === range ? "secondary" : "ghost"}
              className={activeNutritionRange === range ? "bg-gray-100" : ""}
              onClick={() => setActiveNutritionRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
        <Card className="p-8 text-center shadow-lg">
          <p className="text-xl font-semibold">No data to show</p>
          <p className="text-gray-500">This will update as you log more food.</p>
        </Card>
      </div>

      {/* Weight Update Modal */}
      <Dialog open={showWeightModal} onOpenChange={setShowWeightModal}>
        <DialogContent className="w-[90%] max-w-md p-0 bg-white border-none rounded-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Update Weight</DialogTitle>
            <DialogDescription className="sr-only">
              Select your current weight
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Update Weight</h3>
              <div className="flex items-center gap-2">
                <span className={!isMetric ? "font-medium" : "text-gray-400"}>lbs</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    isMetric ? 'bg-black' : 'bg-gray-200'
                  }`}
                  onClick={() => setIsMetric(!isMetric)}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                      isMetric ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={isMetric ? "font-medium" : "text-gray-400"}>kg</span>
              </div>
            </div>
            <div className="border rounded-xl overflow-hidden relative mb-6">
              <div
                ref={weightPickerRef}
                className="wheel-picker-container"
              >
                <div className="wheel-picker-padding" />
                {weightOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`wheel-picker-item ${
                      tempWeight === parseInt(option.value)
                        ? "wheel-picker-selected"
                        : ""
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
                <div className="wheel-picker-padding" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setShowWeightModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-black text-white hover:bg-black/90 rounded-full"
                onClick={handleSaveWeight}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Weight Update Modal */}
      <Dialog open={showGoalWeightModal} onOpenChange={setShowGoalWeightModal}>
        <DialogContent className="w-[90%] max-w-md p-0 bg-white border-none rounded-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Update Goal Weight</DialogTitle>
            <DialogDescription className="sr-only">
              Select your target weight goal
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Update Goal Weight</h3>
              <div className="flex items-center gap-2">
                <span className={!isMetric ? "font-medium" : "text-gray-400"}>lbs</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    isMetric ? 'bg-black' : 'bg-gray-200'
                  }`}
                  onClick={() => setIsMetric(!isMetric)}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                      isMetric ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={isMetric ? "font-medium" : "text-gray-400"}>kg</span>
              </div>
            </div>
            <div className="border rounded-xl overflow-hidden relative mb-6">
              <div
                ref={goalWeightPickerRef}
                className="wheel-picker-container"
              >
                <div className="wheel-picker-padding" />
                {weightOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`wheel-picker-item ${
                      tempGoalWeight === parseInt(option.value)
                        ? "wheel-picker-selected"
                        : ""
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
                <div className="wheel-picker-padding" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setShowGoalWeightModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-black text-white hover:bg-black/90 rounded-full"
                onClick={handleSaveGoalWeight}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NavBar />
    </div>
  );
}