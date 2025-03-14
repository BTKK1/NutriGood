import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Camera, Barcode, Image as ImageIcon, X, HelpCircle, Zap, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeFoodImage, fileToBase64, NutritionAnalysis } from "@/lib/services/foodAnalysis";
import { useLocation } from "wouter";
import ScanGuidePopup from "@/components/food/ScanGuidePopup";
import { useAuth } from "@/contexts/AuthContext";
import { foodTrackingService } from "@/lib/services/foodTracking";

// Food analysis loading states
type ScanningState = 'idle' | 'capturing' | 'analyzing' | 'results';

// Scan modes
type ScanMode = 'food' | 'barcode' | 'gallery';

export default function ScanFood() {
  const [scanMode, setScanMode] = useState<ScanMode>('food');
  const [scanningState, setScanningState] = useState<ScanningState>('idle');
  const [contextText, setContextText] = useState('');
  const [analysisResults, setAnalysisResults] = useState<NutritionAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanGuideOpen, setScanGuideOpen] = useState(false);
  const [previousPath, setPreviousPath] = useState('/');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  
  // Store the previous path when component mounts
  useEffect(() => {
    // Get the previous page from history or use home as fallback
    if (window.history.length > 1) {
      // We need to capture the previous path from document.referrer or sessionStorage
      // because using window.history directly doesn't give us the actual URL
      const referrer = document.referrer;
      const hostname = window.location.hostname;
      
      if (referrer && referrer.includes(hostname)) {
        const url = new URL(referrer);
        setPreviousPath(url.pathname);
      } else {
        // Try to get from session storage
        const lastPath = sessionStorage.getItem('lastPath');
        if (lastPath) {
          setPreviousPath(lastPath);
        }
      }
    }
    
    // Store current path for future use
    sessionStorage.setItem('lastPath', window.location.pathname);
  }, []);

  // Handle file selection from camera or gallery
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const imageFile = files[0];
      const imageBase64 = await fileToBase64(imageFile);
      const imageUrl = URL.createObjectURL(imageFile);
      
      setCapturedImage(imageUrl);
      setScanningState('analyzing');
      
      // Analyze the image
      const results = await analyzeFoodImage(imageBase64, contextText);
      setAnalysisResults(results);
      setScanningState('results');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error analyzing food",
        description: "We couldn't analyze this image. Please try a different image.",
        variant: "destructive"
      });
      setScanningState('idle');
    }
  };

  // Start scanning based on the selected mode
  const startScanning = () => {
    setScanningState('capturing');
    
    // Reset state
    setCapturedImage(null);
    setAnalysisResults(null);
    
    // Trigger file input click based on scan mode
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle close/back
  const handleClose = () => {
    if (scanningState === 'results' || scanningState === 'analyzing') {
      // Go back to the idle state if we're showing results
      setScanningState('idle');
      setCapturedImage(null);
      setAnalysisResults(null);
    } else {
      // Otherwise navigate back to the previous page
      setLocation(previousPath || '/');
    }
  };
  
  // Helper function to format time
  const formatTimeToBurn = () => {
    if (!analysisResults?.timeToBurn) return 'N/A';
    
    const { hours = 0, minutes = 0, seconds = 0 } = analysisResults.timeToBurn;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white">
      {/* Camera interface */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
          <button 
            onClick={handleClose}
            className="w-10 h-10 bg-gray-800/70 rounded-full flex items-center justify-center"
          >
            <X size={20} />
          </button>
          
          <button 
            onClick={() => setScanGuideOpen(true)}
            className="w-10 h-10 bg-gray-800/70 rounded-full flex items-center justify-center"
          >
            <HelpCircle size={20} />
          </button>
        </div>
        
        {/* Camera view / results */}
        <div className="flex-1 flex items-center justify-center">
          {scanningState === 'idle' && (
            <div className="relative w-full h-full">
              {/* Camera frame overlay */}
              {scanMode === 'food' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-xs mx-auto">
                    {/* Top left corner */}
                    <div className="absolute top-1/4 left-1/4 w-12 h-12 border-t-2 border-l-2 border-white" />
                    {/* Top right corner */}
                    <div className="absolute top-1/4 right-1/4 w-12 h-12 border-t-2 border-r-2 border-white" />
                    {/* Bottom left corner */}
                    <div className="absolute bottom-1/4 left-1/4 w-12 h-12 border-b-2 border-l-2 border-white" />
                    {/* Bottom right corner */}
                    <div className="absolute bottom-1/4 right-1/4 w-12 h-12 border-b-2 border-r-2 border-white" />
                  </div>
                </div>
              )}
              
              {scanMode === 'barcode' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="mb-4 text-white font-medium">Barcode Scanner</p>
                    <div className="w-64 h-40 border-2 border-white rounded-lg"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {scanningState === 'analyzing' && (
            <div className="text-center">
              <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
              <p className="text-lg">Analyzing your food...</p>
            </div>
          )}
          
          {scanningState === 'results' && analysisResults && (
            <div className="w-full h-full overflow-auto p-6">
              <div className="max-w-md mx-auto">
                {capturedImage && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img src={capturedImage} alt="Food" className="w-full" />
                  </div>
                )}
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-1">
                    {analysisResults.name || "Food Analysis"}
                  </h2>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-xl font-bold">
                        {analysisResults.calories} kcal
                      </p>
                      <div className="flex items-center text-sm mt-1">
                        <Clock size={14} className="mr-1 text-blue-400" />
                        <span>Time to burn: {formatTimeToBurn()}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap size={16} className="mr-1 text-yellow-400" />
                      <span>Energy</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-sm">Protein</p>
                      <p className="font-bold">{analysisResults.protein}g</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Carbs</p>
                      <p className="font-bold">{analysisResults.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Fat</p>
                      <p className="font-bold">{analysisResults.fats}g</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setScanningState('idle')}
                    className="py-3 bg-gray-700 text-white rounded-xl text-lg font-semibold"
                  >
                    Scan Again
                  </button>
                  <button 
                    onClick={async () => {
                      if (!firebaseUser) {
                        toast({
                          title: "Sign in required",
                          description: "Please sign in to log your food",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      if (!analysisResults) {
                        toast({
                          title: "No data to save",
                          description: "Please scan food first",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      try {
                        setIsSaving(true);
                        
                        // Log the food
                        await foodTrackingService.logFood(firebaseUser.uid, {
                          name: analysisResults.name || "Scanned Food",
                          calories: analysisResults.calories,
                          protein: analysisResults.protein,
                          carbs: analysisResults.carbs,
                          fat: analysisResults.fats,
                          portion: "1 serving",
                          mealType: "lunch", // Default to lunch but could make this selectable
                          imageUrl: capturedImage || undefined,
                        });
                        
                        toast({
                          title: "Food logged successfully",
                          description: "Your food has been added to your diary",
                        });
                        
                        // Return to previous page
                        setLocation(previousPath || '/');
                      } catch (error) {
                        console.error("Error logging food:", error);
                        toast({
                          title: "Failed to log food",
                          description: "There was an error saving your food data",
                          variant: "destructive"
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className={`py-3 bg-white text-black rounded-xl text-lg font-semibold ${isSaving ? 'opacity-70' : ''}`}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom controls */}
        {scanningState === 'idle' && (
          <div className="p-4">
            {/* Context input field */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Add context about the food (optional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white"
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
              />
            </div>
            
            {/* Scan options */}
            <div className="flex justify-center gap-4 mb-6">
              <button 
                onClick={() => setScanMode('food')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl w-24 h-20 ${
                  scanMode === 'food' ? 'bg-white text-black' : 'bg-gray-800 text-white'
                }`}
              >
                <Camera size={24} />
                <span className="text-xs mt-1">Scan Food</span>
              </button>
              
              <button 
                onClick={() => setScanMode('barcode')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl w-24 h-20 ${
                  scanMode === 'barcode' ? 'bg-white text-black' : 'bg-gray-800 text-white'
                }`}
              >
                <Barcode size={24} />
                <span className="text-xs mt-1">Barcode</span>
              </button>
              
              <button 
                onClick={() => setScanMode('gallery')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl w-24 h-20 ${
                  scanMode === 'gallery' ? 'bg-white text-black' : 'bg-gray-800 text-white'
                }`}
              >
                <ImageIcon size={24} />
                <span className="text-xs mt-1">Gallery</span>
              </button>
            </div>
            
            {/* Capture button */}
            <div className="flex justify-center">
              <button 
                onClick={startScanning}
                className="w-16 h-16 rounded-full bg-white p-1"
              >
                <div className="w-full h-full rounded-full border-4 border-black" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden file input for camera/gallery access */}
      <input
        type="file"
        accept="image/*"
        capture={scanMode !== 'gallery' ? 'environment' : undefined}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      {/* Scan guide popup */}
      <ScanGuidePopup 
        open={scanGuideOpen}
        onOpenChange={setScanGuideOpen}
      />
    </div>
  );
}