import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language } from './translations';

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('farsvpn_lang') as Language | null;
    return saved === 'fa' || saved === 'en' ? saved : 'en';
  });

  const setLang = (l: Language) => {
    localStorage.setItem('farsvpn_lang', l);
    setLangState(l);
  };

  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = (key: string): string => {
    return translations[lang][key] ?? translations.en[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
