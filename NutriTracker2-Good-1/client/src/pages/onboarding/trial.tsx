import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
// Stripe integration disabled for now
// import { loadStripe } from "@stripe/stripe-js";
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function TrialPage() {
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate payment processing was successful
      // In a real application, this is where you'd handle the Stripe payment flow
      
      // For now, we'll just mock a successful payment and redirect to home page
      setTimeout(() => {
        navigate("/home");
      }, 1000);
      
      // The below code is commented out for now since we're simulating the payment
      // You can uncomment this for actual Stripe integration
      
      /*
      const priceId = selectedPlan === 'yearly' 
        ? import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID 
        : import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;

      if (!priceId) {
        throw new Error(`Price ID not found for ${selectedPlan} plan`);
      }

      // Create checkout session
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, priceId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No checkout URL received');
      }

      // After successful payment, redirect to auth page instead of home
      navigate("/auth");
      */
    } catch (error) {
      console.error('Subscription Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start trial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate("/payment")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="text-gray-600">
          Restore
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold">
            {selectedPlan === 'yearly' ? 'Start your 3-day FREE trial to continue.' : 'Choose your subscription plan.'}
          </h1>
        </div>

        {selectedPlan === 'yearly' && (
          <div className="w-full max-w-md mx-auto mb-12">
            <div className="relative">
              <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-orange-200"></div>
              <div className="space-y-12">
                <div className="flex items-start">
                  <div className="relative">
                    <div className="absolute left-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🔓</span>
                    </div>
                  </div>
                  <div className="ml-16">
                    <h3 className="font-bold">Today</h3>
                    <p className="text-gray-600">Unlock all the app's features like AI calorie scanning and more.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="relative">
                    <div className="absolute left-0 w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-xl">🔔</span>
                    </div>
                  </div>
                  <div className="ml-16">
                    <h3 className="font-bold">In 2 Days - Reminder</h3>
                    <p className="text-gray-600">We'll send you a reminder that your trial is ending soon.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="relative">
                    <div className="absolute left-0 w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">👑</span>
                    </div>
                  </div>
                  <div className="ml-16">
                    <h3 className="font-bold">In 3 Days - Billing Starts</h3>
                    <p className="text-gray-600">You'll be charged on 8 Mar 2025 unless you cancel anytime before.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-4 mb-8">
          <Card 
            className={`p-4 border-2 cursor-pointer ${
              selectedPlan === 'monthly' ? 'border-black' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="text-center">
              <div className="font-bold">Monthly</div>
              <div>SAR 39.99/mo</div>
            </div>
          </Card>

          <Card 
            className={`p-4 border-2 cursor-pointer ${
              selectedPlan === 'yearly' ? 'border-black' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <div className="text-center">
              <div className="font-bold">Yearly</div>
              <div>SAR 10.83/mo</div>
              <div className="inline-block px-2 py-1 bg-black text-white text-xs rounded-full mt-1">
                3 DAYS FREE
              </div>
            </div>
          </Card>
        </div>

        {selectedPlan === 'yearly' && (
          <div className="w-full max-w-md mx-auto mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4" />
              <span>No Payment Due Now</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-md mx-auto">
          <Button 
            className="w-full bg-black text-white py-6 text-lg font-medium"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : selectedPlan === 'yearly' ? "Start My 3-Day Free Trial" : "Start My Subscription"}
          </Button>
          
          {/* Test button for direct navigation to home page */}
          <Button 
            className="w-full bg-blue-500 text-white py-4 text-md font-medium mt-4"
            onClick={() => navigate("/home")}
          >
            Skip to Home Page (Test Mode)
          </Button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <p className="text-center text-gray-600 text-sm mt-4">
            {selectedPlan === 'yearly' 
              ? '3 days free, then SAR 129.99 per year (SAR 10.83/mo)'
              : 'SAR 39.99 per month'}
          </p>
        </div>
      </div>
    </div>
  );
}