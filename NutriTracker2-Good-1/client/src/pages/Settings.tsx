import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import NavBar from "@/components/ui/nav-bar";
import { ChevronRight, Users, Share2, Copy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageModal } from "@/components/LanguageModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { shareReferralCode } from "@/lib/services/auth";

export default function Settings() {
  const [, navigate] = useLocation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Update settings mutation
  const { mutate: updateSettings } = useMutation({
    mutationFn: async (data: { liveActivity: boolean }) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (value: boolean) => {
    updateSettings({ liveActivity: value });
  };

  const handleShare = async (platform: 'whatsapp' | 'snapchat' | 'copy') => {
    if (user?.referralCode) {
      await shareReferralCode(user.referralCode, platform);
      if (platform === 'copy') {
        toast({
          title: "Code copied!",
          description: "Share with your friends to earn premium access.",
        });
      }
    }
  };

  // Format premium until date
  const formatPremiumDate = (date: Date | null) => {
    if (!date) return null;
    const daysLeft = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} days` : null;
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Personal Stats */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>{t('settings.age')}</Label>
          <span className="text-right">24</span>
        </div>
        <div className="flex justify-between items-center">
          <Label>{t('settings.height')}</Label>
          <span className="text-right">6 ft 11 in</span>
        </div>
        <div className="flex justify-between items-center">
          <Label>{t('settings.currentWeight')}</Label>
          <span className="text-right">118 lbs</span>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h2>Users Invited</h2>
        </div>
        <div className="text-sm text-gray-500">
          {user?.referrals || 0} friends joined
        </div>
        <Button 
          variant="secondary" 
          className="w-full bg-black text-white hover:bg-black/90 flex items-center justify-center gap-2"
          onClick={() => handleShare('copy')}
        >
          <Share2 className="w-4 h-4" />
          Refer friends for 10 days free
        </Button>
        {user?.referralCode && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="font-mono">{user.referralCode}</div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleShare('whatsapp')}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleShare('copy')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Customization */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('settings.customization')}</h2>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/personal-details')}
            className="w-full flex justify-between items-center py-2"
          >
            <Label>{t('settings.personalDetails')}</Label>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={() => navigate('/adjust-goals')}
            className="w-full flex justify-between items-center py-2"
          >
            <Label>{t('settings.adjustGoals')}</Label>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowLanguageModal(true)}
            className="w-full flex justify-between items-center py-2"
          >
            <Label>{t('settings.changeLanguage')}</Label>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('settings.preferences')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.liveActivity')}</Label>
              <p className="text-sm text-gray-500">{t('settings.liveActivityDesc')}</p>
            </div>
            <Switch
              checked={user?.settings?.liveActivity ?? false}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </div>

      <LanguageModal 
        open={showLanguageModal}
        onOpenChange={setShowLanguageModal}
      />

      <NavBar />
    </div>
  );
}