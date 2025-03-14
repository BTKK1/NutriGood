import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";

interface LanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageModal({ open, onOpenChange }: LanguageModalProps) {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', localName: 'English' },
    { code: 'ar', name: 'Arabic', localName: 'العربية' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay />
      <DialogContent className="w-[90%] max-w-md p-6 bg-white rounded-xl">
        <h3 className="text-xl font-bold mb-6">Select Language / اختر اللغة</h3>
        <div className="space-y-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="ghost"
              className="w-full p-4 flex items-center justify-between rounded-lg hover:bg-gray-50"
              onClick={() => {
                setLanguage(lang.code as 'en' | 'ar');
                onOpenChange(false);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.name}</span>
                <span className="text-gray-500">({lang.localName})</span>
              </div>
              {language === lang.code && (
                <Check className="w-5 h-5 text-black" />
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}