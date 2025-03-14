import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, firebaseUser, isNewUser, loading } = useAuth();
  
  // Effect to handle redirects after authentication
  useEffect(() => {
    if (loading) return; // Wait until auth state is determined
    
    // If we have a user and they're new, go to onboarding
    if (firebaseUser && isNewUser) {
      console.log("New user detected - redirecting to onboarding");
      navigate("/onboarding");
      return;
    }
    
    // If we have a returning user with completed onboarding, go to home
    if (firebaseUser && !isNewUser && user?.onboardingComplete) {
      console.log("Returning user detected - redirecting to home");
      navigate("/home");
      return;
    }
    
    // If we have a returning user who hasn't completed onboarding, send them there
    if (firebaseUser && !isNewUser && !user?.onboardingComplete) {
      console.log("User with incomplete onboarding - redirecting to onboarding");
      navigate("/onboarding");
      return;
    }
  }, [firebaseUser, isNewUser, user, loading, navigate]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({
          title: "Account created",
          description: "Your account has been created. Welcome!",
        });
        // No redirect needed here - the useEffect will handle it
      } else {
        await signInWithEmail(email, password);
        toast({
          title: "Signed in",
          description: "You've been signed in successfully.",
        });
        // No redirect needed here - the useEffect will handle it
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsProcessing(true);
      
      const user = await signInWithGoogle();
      if (user) {
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        toast({
          title: isNewUser ? "Account created" : "Signed in",
          description: isNewUser 
            ? "Your account has been created with Google. Welcome!" 
            : "You've been signed in successfully with Google.",
        });
        // No redirect needed here - the useEffect will handle it
      }
    } catch (error: any) {
      toast({
        title: "Google Sign-In Error",
        description: error.message || "An error occurred during Google sign-in.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleAppleSignIn = () => {
    toast({
      title: "Not Available",
      description: "Apple Sign-In is not available at this time.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>

        <div className="w-full max-w-md space-y-4">
          {/* Email sign-in form */}
          <div className="space-y-3 mb-6">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-full px-6"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-full px-6"
            />
            <Button
              onClick={handleEmailAuth}
              className="w-full h-14 rounded-full"
              variant="default"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center mt-2">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
                type="button"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleAppleSignIn}
            className="w-full py-4 px-6 bg-black text-white rounded-full flex items-center justify-center font-medium text-base h-14"
          >
            <svg
              className="w-5 h-5 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.085 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.69 3.559-1.701" />
            </svg>
            Sign in with Apple
          </button>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 px-6 border border-gray-300 rounded-full flex items-center justify-center font-medium text-base h-14"
            disabled={isProcessing}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            {isProcessing ? "Processing..." : "Sign in with Google"}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          <button 
            onClick={() => navigate("/home")}
            className="text-primary underline"
          >
            Skip sign-in (Offline Mode)
          </button>
        </p>
      </div>
    </div>
  );
}