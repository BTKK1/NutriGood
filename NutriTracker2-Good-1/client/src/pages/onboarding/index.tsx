import React, { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import type { OnboardingData } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveOnboardingData,
  getOnboardingData,
  clearOnboardingData,
} from "@/lib/onboardingStorage";
import {
  initializeFirestoreCollections,
  updateUserDocument,
} from "@/lib/firebase";
import * as Steps from "./steps";
import { calculateHealthScore } from "@/lib/health-calculations";

// Steps in the onboarding flow (corrected order: goal-type before goal-speed)
const STEPS = [
  "source",
  "gender",
  "age",
  "weight",
  "goal-type", // Moved before goal-speed
  "goal-speed",
  "long-term-results",
  "results",
  "workouts",
  "experience",
  "barriers",
  "diet-type",
  "recommendations",
  "journey",
  "completing",
];

/**
 * Main onboarding flow component that manages the steps for user onboarding
 */
export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { firebaseUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>(
    getOnboardingData() || {},
  );

  // Initialize Firestore collections when user signs in
  useEffect(() => {
    if (firebaseUser) {
      initializeFirestoreCollections(firebaseUser.uid)
        .then(() => console.log("Firestore collections initialized"))
        .catch((err) =>
          console.error("Error initializing Firestore collections:", err),
        );
    }
  }, [firebaseUser]);

  // Handle step navigation with conditional skip for "maintain"
  const handleNext = (data: Partial<OnboardingData>) => {
    // Update onboarding data with new values
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    saveOnboardingData(updatedData);

    // Move to next step with conditional skip
    if (currentStep < STEPS.length - 1) {
      let nextStep = currentStep + 1;
      // If the current step is "goal-type" and goalType is "maintain", skip "goal-speed"
      if (
        STEPS[currentStep] === "goal-type" &&
        updatedData.goalType === "maintain"
      ) {
        nextStep++; // Skip "goal-speed"
      }
      setCurrentStep(nextStep);
    } else {
      // If this is the last step, save the data to Firestore
      if (firebaseUser) {
        // Calculate health score
        const healthScore = calculateHealthScore({
          workoutsPerWeek: updatedData.workoutsPerWeek || 0,
          goalType: updatedData.goalType || "lose",
          goalSpeed: updatedData.goalSpeed || 0.8,
          dietType: updatedData.dietType as any,
          experience: updatedData.experience as any,
          barriers: updatedData.barriers || [],
        });

        // Save all onboarding data including health score to Firestore
        updateUserDocument(firebaseUser.uid, {
          onboardingData: updatedData,
          healthScore,
          onboardingComplete: true,
        })
          .then(() => {
            console.log("Onboarding data saved to Firestore");
            // Clear local storage onboarding data since it's now in Firestore
            clearOnboardingData();
            // Navigate to home page or home
            navigate("/home");
          })
          .catch((err) => {
            console.error("Error saving onboarding data:", err);
          });
      } else {
        console.warn("No user found, can't save onboarding data to Firestore");
        navigate("/auth");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;
      // If the current step is after "goal-speed" and goalType is "maintain", skip back over "goal-speed"
      if (
        currentStep > STEPS.indexOf("goal-speed") &&
        onboardingData.goalType === "maintain"
      ) {
        prevStep--; // Skip "goal-speed" when going back
      }
      setCurrentStep(prevStep);
    } else {
      navigate("/"); // Go to welcome page
    }
  };

  // Render the current onboarding step
  const renderCurrentStep = () => {
    const stepName = STEPS[currentStep];

    switch (stepName) {
      case "source":
        return <Steps.SourceStep data={onboardingData} onNext={handleNext} />;
      case "gender":
        return (
          <Steps.GenderStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "age":
        return (
          <Steps.AgeStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "weight":
        return (
          <Steps.WeightStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "goal-type":
        return (
          <Steps.GoalTypeStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "goal-speed":
        return (
          <Steps.GoalSpeedStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "long-term-results":
        return (
          <Steps.LongTermResultsStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "results":
        return (
          <Steps.ResultsStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "workouts":
        return (
          <Steps.WorkoutsStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "experience":
        return (
          <Steps.ExperienceStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "barriers":
        return (
          <Steps.BarriersStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "diet-type":
        return (
          <Steps.DietTypeStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "recommendations":
        return (
          <Steps.RecommendationsStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "journey":
        return (
          <Steps.YourFitnessJourneyStep
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "completing":
        return (
          <Steps.CompletingOnboardingStep
            data={onboardingData}
            onNext={handleNext}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Adjust progress indicator for skipped steps
  const totalSteps =
    onboardingData.goalType === "maintain" ? STEPS.length - 1 : STEPS.length;
  const adjustedStep =
    currentStep > STEPS.indexOf("goal-speed") &&
    onboardingData.goalType === "maintain"
      ? currentStep - 1
      : currentStep;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {renderCurrentStep()}
      </div>

      {/* Progress indicator */}
      <div className="py-4 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Step {adjustedStep + 1} of {totalSteps}
            </div>
            <div className="w-2/3 bg-muted-foreground/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${((adjustedStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
