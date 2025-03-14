import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function WelcomePage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-full aspect-[390/844] bg-gray-100 rounded-[3rem] mb-8 relative overflow-hidden">
          {/* This is a placeholder for the app screenshot - we'll add the image later */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            App Preview Image
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Calorie tracking made easy
        </h1>

        <Button 
          className="w-full bg-black text-white py-6 text-lg"
          onClick={() => {
            // Navigate to onboarding page
            navigate("/onboarding");
          }}
        >
          Let's Get Started
        </Button>
        
        {/* Test buttons for direct navigation */}
        <div className="w-full mt-6 grid grid-cols-2 gap-4">
          <Button 
            className="bg-blue-500 text-white py-3"
            onClick={() => navigate("/auth")}
          >
            Skip to Auth (Test)
          </Button>
          
          <Button 
            className="bg-green-500 text-white py-3"
            onClick={() => navigate("/home")}
          >
            Skip to Home (Test)
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Test buttons for development only
        </p>
      </div>
    </div>
  );
}