import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataSyncProvider } from "@/contexts/DataSyncContext";
import ConnectionStatusBanner from "@/components/ConnectionStatusBanner";
import HomePage from "@/pages/Home";
import AnalyticsPage from "@/pages/Analytics";
import SettingsPage from "@/pages/Settings";
import WelcomePage from "@/pages/onboarding/welcome";
import AuthPage from "@/pages/auth";
import OnboardingPage from "@/pages/onboarding";
import PaymentPage from "@/pages/onboarding/payment";
import TrialPage from "@/pages/onboarding/trial";
import NotFound from "@/pages/not-found";
import FoodDatabase from "@/pages/food/Database";
import EmptyFood from "@/pages/food/EmptyFood";
import CreateFood from "@/pages/food/CreateFood";
import CreateMeal from "@/pages/food/CreateMeal";
import AddIngredient from "@/pages/food/AddIngredient";
import IngredientsList from "@/pages/food/IngredientsList";
import MealItemsList from "@/pages/food/MealItemsList";
import ScanFood from "@/pages/food/ScanFood";
import LogExercise from "@/pages/exercise/LogExercise";
import RunExercise from "@/pages/exercise/Run";
import WeightLifting from "@/pages/exercise/WeightLifting";
import DescribeExercise from "@/pages/exercise/Describe";
import PersonalDetails from "@/pages/settings/PersonalDetails";
import AdjustGoals from "@/pages/settings/AdjustGoals";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={WelcomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/home" component={HomePage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/home" component={HomePage} />
        <Route path="/trial" component={TrialPage} />
        <Route path="/home" component={HomePage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/food" component={FoodDatabase} />
        <Route path="/food/database" component={FoodDatabase} />
        <Route path="/food/all" component={FoodDatabase} />
        <Route path="/food/meals" component={FoodDatabase} />
        <Route path="/food/my-foods" component={FoodDatabase} />
        <Route path="/food/saved" component={FoodDatabase} />
        <Route path="/food/empty" component={EmptyFood} />
        <Route path="/food/create" component={CreateFood} />
        <Route path="/food/create-meal" component={CreateMeal} />
        <Route path="/food/add-ingredient" component={AddIngredient} />
        <Route path="/food/ingredients-list" component={IngredientsList} />
        <Route path="/food/meal-items" component={MealItemsList} />
        <Route path="/food/scan" component={ScanFood} />
        <Route path="/exercise" component={LogExercise} />
        <Route path="/exercise/run" component={RunExercise} />
        <Route path="/exercise/weight-lifting" component={WeightLifting} />
        <Route path="/exercise/describe" component={DescribeExercise} />
        <Route path="/personal-details" component={PersonalDetails} />
        <Route path="/adjust-goals" component={AdjustGoals} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <DataSyncProvider>
            <ConnectionStatusBanner />
            <Router />
            <Toaster />
          </DataSyncProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
