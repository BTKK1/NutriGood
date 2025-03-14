import { Link, useLocation } from "wouter";
import { Dumbbell, BookmarkCheck, Search, Camera } from "lucide-react";
import { useState } from "react";
import ScanGuidePopup from "@/components/food/ScanGuidePopup";

export default function ActionMenu({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const [showScanGuide, setShowScanGuide] = useState(false);

  const handleScanFood = () => {
    // Direct navigation without popup for now
    navigate("/food/scan");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose}>
        <div 
          className="fixed bottom-24 left-1/2 -translate-x-1/2" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <Link href="/exercise" onClick={onClose}>
                <button className="w-[120px] h-[80px] bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1.5">
                  <Dumbbell className="w-6 h-6" />
                  <span className="text-[13px] font-medium">Log exercise</span>
                </button>
              </Link>

              <Link href="/food/saved" onClick={onClose}>
                <button className="w-[120px] h-[80px] bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1.5">
                  <BookmarkCheck className="w-6 h-6" />
                  <span className="text-[13px] font-medium">Saved foods</span>
                </button>
              </Link>
            </div>

            <div className="flex gap-2.5">
              <Link href="/food/database" onClick={onClose}>
                <button className="w-[120px] h-[80px] bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1.5">
                  <Search className="w-6 h-6" />
                  <span className="text-[13px] font-medium">Food Database</span>
                </button>
              </Link>

              <button
                onClick={handleScanFood}
                className="w-[120px] h-[80px] bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[13px] font-medium">Scan food</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showScanGuide && (
        <ScanGuidePopup
          open={showScanGuide}
          onOpenChange={setShowScanGuide}
          onScanNow={() => {
            setShowScanGuide(false);
            navigate("/food/scan");
            onClose();
          }}
        />
      )}
    </>
  );
}