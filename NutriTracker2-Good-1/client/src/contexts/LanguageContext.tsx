import { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'settings.age': 'Age',
    'settings.height': 'Height',
    'settings.currentWeight': 'Current weight',
    'settings.balance': 'Current Balance',
    'settings.referFriends': 'Refer friends to earn $',
    'settings.customization': 'Customization',
    'settings.personalDetails': 'Personal details',
    'settings.adjustGoals': 'Adjust goals',
    'settings.caloriesCarbs': 'Calories, carbs, fats, and protein',
    'settings.changeLanguage': 'Change language',
    'settings.preferences': 'Preferences',
    'settings.burnedCalories': 'Burned Calories',
    'settings.burnedCaloriesDesc': 'Add burned calories to daily goal',
    'settings.liveActivity': 'Live Activity',
    'settings.liveActivityDesc': 'Show your daily calories and macros on the lock screen and on dynamic island',
  },
  ar: {
    'settings.age': 'العمر',
    'settings.height': 'الطول',
    'settings.currentWeight': 'الوزن الحالي',
    'settings.balance': 'الرصيد الحالي',
    'settings.referFriends': 'قم بدعوة أصدقائك للحصول على المال',
    'settings.customization': 'التخصيص',
    'settings.personalDetails': 'المعلومات الشخصية',
    'settings.adjustGoals': 'تعديل الأهداف',
    'settings.caloriesCarbs': 'السعرات الحرارية والكربوهيدرات والدهون والبروتين',
    'settings.changeLanguage': 'تغيير اللغة',
    'settings.preferences': 'التفضيلات',
    'settings.burnedCalories': 'السعرات الحرارية المحروقة',
    'settings.burnedCaloriesDesc': 'إضافة السعرات الحرارية المحروقة إلى الهدف اليومي',
    'settings.liveActivity': 'النشاط المباشر',
    'settings.liveActivityDesc': 'عرض السعرات الحرارية اليومية والعناصر الغذائية على شاشة القفل وعلى الجزيرة الديناميكية',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
