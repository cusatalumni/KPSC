import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../translations/ml'; // Default language
import { translations as translationsEn } from '../translations/en';

type Language = 'ml' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const allTranslations = {
  ml: translations,
  en: translationsEn,
};

// Function to get a nested property from an object using a dot-notation string
const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ml');

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    let text = getNestedTranslation(allTranslations[language], key);

    if (!text) {
        // Fallback to English if translation is missing in the current language
        text = getNestedTranslation(allTranslations.en, key);
    }
    
    if (!text) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as a fallback
    }

    if (options) {
      Object.keys(options).forEach(k => {
        text = text!.replace(new RegExp(`{{${k}}}`, 'g'), String(options[k]));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};