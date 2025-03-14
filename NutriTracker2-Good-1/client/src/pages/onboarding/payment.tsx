import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";

export default function PaymentPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Restore Link */}
      <div className="text-right mb-8">
        <button className="text-gray-600 text-sm">Restore</button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-between">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            We want you to try Saraat AI for free.
          </h1>
        </div>

        <div className="w-full max-w-md">
          {/* App Preview Image - using a placeholder div for now */}
          <div className="bg-gray-100 rounded-2xl h-64 mb-8"></div>

          {/* Payment Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="no-payment"
                checked={true}
                disabled
              />
              <label htmlFor="no-payment" className="text-sm">
                No Payment Due Now
              </label>
            </div>

            <Button 
              className="w-full bg-black text-white py-6 text-lg font-medium"
              onClick={() => navigate("/trial")}
            >
              Try for $0.00
            </Button>
            
            {/* Test button for direct navigation to home page */}
            <Button 
              className="w-full bg-blue-500 text-white py-4 text-md font-medium"
              onClick={() => navigate("/home")}
            >
              Skip Payment (Test Mode)
            </Button>

            <p className="text-center text-gray-600 text-sm">
              Just SAR 129.99 per year (SAR 10.83/mo)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}