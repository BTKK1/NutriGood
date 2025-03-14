import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

export default function PersonalDetails() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center px-4 py-3 border-b">
        <button 
          onClick={() => navigate('/settings')}
          className="w-[42px] h-[42px] rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-3 text-[17px] font-normal">{t('settings.personalDetails')}</h1>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-lg">24</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowAgeModal(true)}
              className="border border-gray-200"
            >
              Update
            </Button>
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Height</p>
              <p className="text-lg">6 ft 11 in</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowHeightModal(true)}
              className="border border-gray-200"
            >
              Update
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="text-lg">118 lbs</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowWeightModal(true)}
              className="border border-gray-200"
            >
              Update
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}