import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Camera, Lightbulb, ImageDown, Check } from 'lucide-react';

interface ScanGuidePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanNow?: () => void;
}

export default function ScanGuidePopup({
  open,
  onOpenChange,
  onScanNow,
}: ScanGuidePopupProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Food Scanning Tips
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Good lighting:</span> Take photos in well-lit environments for accurate food recognition.
              </p>
            </div>
            
            <div className="flex items-start">
              <ImageDown className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Full view:</span> Capture the entire plate or food item clearly in the frame.
              </p>
            </div>
            
            <div className="flex items-start">
              <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Add context:</span> For better results, add details about the food in the text field (e.g., "Greek yogurt with honey and berries").
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Scan Modes:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold mr-1">• Scan Food:</span> 
                Use for prepared meals and whole foods
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-1">• Barcode:</span> 
                Scan packaged food barcodes for accurate data
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-1">• Food Label:</span> 
                Capture nutrition facts labels from packaging
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-1">• Gallery:</span> 
                Select previously taken food photos
              </li>
            </ul>
          </div>
        </AlertDialogDescription>
        
        <AlertDialogFooter>
          <Button 
            onClick={() => {
              onOpenChange(false);
              if (onScanNow) onScanNow();
            }}
            className="w-full"
          >
            Scan Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}