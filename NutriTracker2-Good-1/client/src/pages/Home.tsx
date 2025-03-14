import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/ui/nav-bar";
import RecentActivity from "@/components/RecentActivity";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { getUserNutritionTargets } from "@/lib/onboardingStorage";
import {
  Apple,
  Flame,
  Heart,
  Beef,
  Wheat,
  Utensils,
  Settings,
  Footprints,
  Dumbbell,
  CheckCircle,
  Bookmark,
  Search,
  Camera,
  Clock,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ScanGuide from "@/assets/images/ScanGuide.png";
import Logo from "@/assets/images/Logo.png"; // Imported logo as a module

export default function Home() {
  const { user } = useAuth(); // Simplified - removed Firebase-specific refs
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for retry mechanism
  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterCups, setWaterCups] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [showWaterSettings, setShowWaterSettings] = useState(false);
  const [dailyGoalFlOz, setDailyGoalFlOz] = useState(64);
  const [tempGoalFlOz, setTempGoalFlOz] = useState(dailyGoalFlOz);
  const [customGoalFlOz, setCustomGoalFlOz] = useState("");
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Scan guide removed as requested
  const [showScanGuide, setShowScanGuide] = useState(false);

  // Initialize offline mode from localStorage
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem('saraat_offline_mode');
    if (savedOfflineMode === 'true') {
      setOfflineMode(true);
    }
  }, []);

  // Reset temp value when opening modal
  useEffect(() => {
    if (showWaterSettings) {
      setTempGoalFlOz(dailyGoalFlOz);
      setCustomGoalFlOz(dailyGoalFlOz.toString());
    }
  }, [showWaterSettings, dailyGoalFlOz]);

  const handleWaterChange = (change: number) => {
    const newAmount = Math.max(0, waterAmount + change);
    setWaterAmount(newAmount);
    setWaterCups(newAmount / 8);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const newSection = Math.round(container.scrollLeft / container.offsetWidth);
    setActiveSection(newSection);
  };

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    const handleScroll = () => {
      const itemHeight = 48;
      const scrollTop = picker.scrollTop;
      const selectedIndex = Math.round(scrollTop / itemHeight);

      // Remove selected class from all items
      const items = picker.getElementsByClassName("wheel-picker-item");
      Array.from(items).forEach((item) => {
        item.classList.remove("wheel-picker-selected");
      });

      // Add selected class to current item
      if (items[selectedIndex]) {
        items[selectedIndex].classList.add("wheel-picker-selected");
      }

      const value = flOzOptions[selectedIndex]?.value;
      if (value) {
        if (value === "Custom") {
          setIsCustomGoal(true);
          setTempGoalFlOz(customGoalFlOz ? parseInt(customGoalFlOz) : 64);
        } else {
          setIsCustomGoal(false);
          setTempGoalFlOz(parseInt(value));
        }
      }
    };

    picker.addEventListener("scroll", handleScroll);
    return () => picker.removeEventListener("scroll", handleScroll);
  }, [customGoalFlOz]);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const dates = [2, 3, 4, 5, 6, 7, 8];
  
  // Get user email from localStorage
  const userEmail = localStorage.getItem('user_email') || undefined;
  
  // Get user nutrition targets from localStorage
  const nutritionTargets = getUserNutritionTargets(userEmail);
  
  // Define nutrition values - use stored values if available, otherwise use defaults
  const maxCalories = nutritionTargets?.calories || 2000;
  const maxProtein = nutritionTargets?.protein || 120;
  const maxCarbs = nutritionTargets?.carbs || 300;
  const maxFat = nutritionTargets?.fat || 70;
  
  // For demo purposes, we'll simulate some calories consumed (real app would track actual consumption)
  const consumedCalories = 250; // Simulated consumed calories
  const consumedProtein = 15;   // Simulated consumed protein
  const consumedCarbs = 35;     // Simulated consumed carbs
  const consumedFat = 10;       // Simulated consumed fat
  
  // Calculate remaining values
  const caloriesLeft = maxCalories - consumedCalories;
  const proteinLeft = maxProtein - consumedProtein;
  const carbsLeft = maxCarbs - consumedCarbs;
  const fatLeft = maxFat - consumedFat;

  const calorieProgress = ((maxCalories - caloriesLeft) / maxCalories) * 100;
  const proteinProgress = ((maxProtein - proteinLeft) / maxProtein) * 100;
  const carbsProgress = ((maxCarbs - carbsLeft) / maxCarbs) * 100;
  const fatProgress = ((maxFat - fatLeft) / maxFat) * 100;

  const getProgress = (value: number) => Math.min(Math.max(value, 0), 100);

  const flOzOptions = Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
    value: (i + 1).toString(),
  })).concat([{ id: "custom", value: "Custom" }]);

  const requestAppleHealthAccess = async () => {
    try {
      // Check if Health Kit is available (iOS only)
      if ("webkit" in window && "messageHandlers" in (window as any).webkit) {
        // Request authorization for steps data
        await (window as any).webkit.messageHandlers.healthKit.postMessage({
          request: "requestAuthorization",
          dataTypes: ["steps"],
        });
      } else {
        console.log("Apple Health is not available on this device");
      }
    } catch (error) {
      console.error("Error requesting Apple Health access:", error);
    }
  };

  // Handle scan food action
  const handleScanFood = () => {
    // Always navigate using the window.location for now
    window.location.href = "/food/scan";
  };

  // Function to handle enabling offline mode
  const enableOfflineMode = () => {
    setOfflineMode(true);
    // Store offline mode preference in localStorage
    localStorage.setItem('saraat_offline_mode', 'true');
    toast({
      title: "Offline Mode Enabled",
      description: "You can now use the app with limited functionality.",
      variant: "default",
    });
  };

  // Function to refresh the page
  const refreshPage = () => {
    toast({
      title: "Refreshing Page",
      description: "Reloading the application...",
      variant: "default",
    });
    // Force a refresh after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Removed Firebase Connectivity Error Alert */}
      
      {/* Offline Mode Banner */}
      {offlineMode && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4 mx-4 mt-4">
          <AlertTriangle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Offline Mode Active</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p className="mb-2">You're using the app in offline mode with limited functionality.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                localStorage.removeItem('saraat_offline_mode');
                setOfflineMode(false);
                window.location.reload();
              }}
              className="flex items-center gap-1 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCcw className="h-3 w-3" />
              Try to Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* App Header */}
      <div className="flex justify-between items-center px-4 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden pt-1">
            <img
              src={Logo}
              alt="Saraat AI Logo"
              className="w-12 h-12 object-contain"
            />{" "}
            {/* Increased size and added padding to push down */}
          </div>
          <h1 className="text-2xl font-bold">Saraat AI</h1>{" "}
          {/* Increased font size */}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
          <Flame className="text-orange-500" size={18} />
          <span>0</span>
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="flex justify-between px-2 py-4 bg-white">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-sm text-gray-500">{day}</span>
            <div
              className={`w-8 h-8 flex items-center justify-center mt-1 rounded-full ${
                i === 3
                  ? "border-2 border-dashed border-gray-300 bg-gray-200"
                  : ""
              }`}
            >
              <span className="text-sm">{dates[i]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable Sections */}
      <div className="mt-4 relative">
        <div
          className="overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
          onScroll={handleScroll}
        >
          <div className="flex min-w-[200%]">
            {/* First Section: Main Stats Card, Macro Cards */}
            <div className="w-1/2 px-4 snap-start">
              {/* Main Stats Card */}
              <Card className="p-8 mx-4 mt-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <h2 className="text-5xl font-bold">{caloriesLeft}</h2>
                      <Flame className="h-8 w-8 text-orange-500" />
                    </div>
                    <p className="text-gray-500 mt-1">Calories left</p>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Burns in: 2h 30m</span>
                    </div>
                  </div>
                  <div className="relative w-28 h-28">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#000"
                        strokeWidth="10"
                        strokeDasharray="282.74"
                        strokeDashoffset={
                          282.74 - (282.74 * getProgress(calorieProgress)) / 100
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {Math.round(calorieProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Macro Cards */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {/* Protein Card */}
                <Card className="p-4 shadow-lg">
                  <div className="space-y-2 text-center">
                    <div className="w-6 h-6 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                      <Beef className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-[17px] font-semibold">
                      {proteinLeft}g
                    </h3>
                    <p className="text-[13px] text-gray-500">Protein left</p>
                    <div className="relative w-[52px] h-[52px] mx-auto">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e0e0e0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#000"
                          strokeWidth="8"
                          strokeDasharray="251.33"
                          strokeDashoffset={
                            251.33 -
                            (251.33 * getProgress(proteinProgress)) / 100
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] font-medium">
                          {Math.round(proteinProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Carbs Card */}
                <Card className="p-4 shadow-lg">
                  <div className="space-y-2 text-center">
                    <div className="w-6 h-6 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                      <Wheat className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-[17px] font-semibold">{carbsLeft}g</h3>
                    <p className="text-[13px] text-gray-500">Carbs left</p>
                    <div className="relative w-[52px] h-[52px] mx-auto">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e0e0e0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#000"
                          strokeWidth="8"
                          strokeDasharray="251.33"
                          strokeDashoffset={
                            251.33 - (251.33 * getProgress(carbsProgress)) / 100
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] font-medium">
                          {Math.round(carbsProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Fat Card */}
                <Card className="p-4 shadow-lg">
                  <div className="space-y-2 text-center">
                    <div className="w-6 h-6 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-blue-500" />
                    </div>
                    <h2 className="text-[17px] font-semibold">{fatLeft}g</h2>
                    <p className="text-[13px] text-gray-500">Fat left</p>
                    <div className="relative w-[52px] h-[52px] mx-auto">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e0e0e0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#000"
                          strokeWidth="8"
                          strokeDasharray="251.33"
                          strokeDashoffset={
                            251.33 - (251.33 * getProgress(fatProgress)) / 100
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] font-medium">
                          {Math.round(fatProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Health Score Card */}
              {nutritionTargets && nutritionTargets.healthScore && (
                <Card className="p-6 mt-6 mx-4 shadow-lg bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span role="img" aria-label="heart" className="text-2xl text-rose-500">❤️</span>
                    <h2 className="text-xl font-semibold">Health Score</h2>
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Your score</span>
                      <span className="text-sm font-medium">{nutritionTargets.healthScore}/10</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" 
                        style={{ width: `${nutritionTargets.healthScore * 10}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Personalized health insights based on your:</p>
                    <ul className="space-y-1 pl-5 list-disc text-gray-500">
                      <li>Dietary preferences: {nutritionTargets.dietType || 'Standard'}</li>
                      <li>Workout frequency: {nutritionTargets.workoutsPerWeek || 0}/week</li>
                      <li>Nutrition balance: {nutritionTargets.healthScore >= 7 ? 'Excellent' : nutritionTargets.healthScore >= 5 ? 'Good' : 'Needs improvement'}</li>
                    </ul>
                  </div>
                </Card>
              )}
            </div>

            {/* Second Section: Activity Cards */}
            <div className="w-1/2 px-4 snap-start">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Steps Widget */}
                  <Card className="p-8 shadow-lg">
                    <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                      <p className="text-sm text-gray-500">Steps today</p>
                      <p className="text-4xl font-medium">0</p>
                      <div className="mt-4 text-center">
                        <Heart
                          className="inline-block text-red-500 mb-3"
                          size={24}
                        />
                        <button
                          onClick={requestAppleHealthAccess}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <p>Connect Apple Health</p>
                          <p>to track your steps</p>
                        </button>
                      </div>
                    </div>
                  </Card>

                  {/* Calories Burned Widget */}
                  <Card className="p-8 shadow-lg">
                    <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                      <p className="text-sm text-gray-500">Calories burned</p>
                      <p className="text-4xl font-medium">278</p>
                      <div className="space-y-2 mt-4 w-full">
                        <div className="flex items-center justify-between gap-4 text-sm px-4">
                          <Footprints className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-500 flex-1">Steps</span>
                          <span>+0</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-sm px-4">
                          <Dumbbell className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-500 flex-1">Boxing</span>
                          <span>+278</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Water Tracking */}
                <Card className="p-8 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">💧</span>
                      <div>
                        <p className="text-base">
                          {waterAmount} fl oz ({waterCups.toFixed(1)} cups)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleWaterChange(-8)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-xl font-medium"
                      >
                        −
                      </button>
                      <button
                        onClick={() => handleWaterChange(8)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-xl font-medium"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setShowWaterSettings(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
                      >
                        <Settings size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Section Indicator Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  activeSection === index ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trial Notice */}
      <Card className="p-4 mx-4 mt-4 bg-gradient-to-r from-pink-50 to-blue-50 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-block px-3 py-1 bg-red-100 text-red-500 rounded-full text-[13px]">
                80% off
              </div>
              <p className="font-medium text-[15px]">
                Your trial ends tomorrow!!
              </p>
            </div>
            <div className="text-[15px] font-medium">
              <span>24</span>
              <span className="mx-2">:</span>
              <span>08</span>
              <span className="mx-2">:</span>
              <span>02</span>
            </div>
          </div>
          <button className="w-full py-2 bg-black text-white rounded-xl text-[13px] font-medium">
            Resubscribe now
          </button>
        </div>
      </Card>

      {/* Recently Logged Section - using the new component */}
      <RecentActivity />

      {/* Water Settings Modal */}
      {showWaterSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 bg-white rounded-xl w-11/12 max-w-lg mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Water Settings
              </h3>
              <button
                onClick={() => setShowWaterSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serving size
                </label>
                <div className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-lg font-semibold text-gray-900 flex justify-between items-center">
                  <span>
                    {tempGoalFlOz} fl oz ({(tempGoalFlOz / 8).toFixed(1)} cups)
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How much water do you need to stay hydrated?
                </label>
                <div className="relative">
                  <div
                    ref={pickerRef}
                    className="wheel-picker-container h-[256px] overflow-y-auto no-scrollbar snap-y snap-mandatory"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    <div
                      className="wheel-picker-padding"
                      style={{ height: "104px" }}
                    />
                    {Array.from({ length: 100 }, (_, i) => i + 1)
                      .map(String)
                      .concat(["Custom"])
                      .map((value) => (
                        <div
                          key={value}
                          className={`wheel-picker-item h-12 flex items-center justify-center snap-center transition-all duration-200 ${
                            (isCustomGoal && value === "Custom") ||
                            (!isCustomGoal && value === tempGoalFlOz.toString())
                              ? "wheel-picker-selected"
                              : ""
                          }`}
                        >
                          {value}
                        </div>
                      ))}
                    <div
                      className="wheel-picker-padding"
                      style={{ height: "104px" }}
                    />
                  </div>
                </div>
                {isCustomGoal && (
                  <input
                    type="number"
                    className="w-full p-4 mt-4 border-2 border-gray-200 rounded-lg text-2xl font-bold text-center bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter custom fl oz"
                    value={customGoalFlOz}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomGoalFlOz(value);
                      const parsedValue = parseInt(value);
                      if (!isNaN(parsedValue) && parsedValue > 0) {
                        setTempGoalFlOz(parsedValue);
                      }
                    }}
                    min="1"
                  />
                )}
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Everyone's needs are slightly different, but we recommend
                  aiming for at least 64 fl oz (8 cups) of water each day.
                </p>
              </div>
              <div className="flex justify-between space-x-4">
                <button
                  onClick={() => {
                    setShowWaterSettings(false);
                    // Reset temp values without saving
                    setTempGoalFlOz(dailyGoalFlOz);
                    setCustomGoalFlOz(dailyGoalFlOz.toString());
                  }}
                  className="w-1/2 py-3 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save the temporary value to the actual state
                    setDailyGoalFlOz(tempGoalFlOz);
                    setShowWaterSettings(false);
                  }}
                  className="w-1/2 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Scan Guide Pop-up Removed */}

      <NavBar />
    </div>
  );
}
