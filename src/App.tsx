import { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { I18nProvider, useI18n } from '@/i18n/I18nContext';
import { LanguageSelect } from '@/components/LanguageSelect';
import { TermsGate } from '@/components/TermsGate';
import { AuthScreen } from '@/components/AuthScreen';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';
import { HistoryPage } from '@/components/HistoryPage';
import { AdminPanel } from '@/components/AdminPanel';
import { FarsVpnLogo } from '@/components/FarsVpnLogo';
import type { Language } from '@/i18n/translations';

type AppStep = 'language' | 'terms' | 'auth' | 'dashboard' | 'settings' | 'history' | 'admin';

function AppContent() {
  const { user, authLoading } = useApp();
  const { lang, setLang } = useI18n();

  const [step, setStep] = useState<AppStep>(() => {
    const tosAccepted = localStorage.getItem('farsvpn_tos_accepted') === 'true';
    if (tosAccepted) return 'auth';
    const hasLang = localStorage.getItem('farsvpn_lang');
    if (hasLang) return 'terms';
    return 'language';
  });

  useEffect(() => {
    const onAccepted = () => {
      localStorage.setItem('farsvpn_tos_accepted', 'true');
      setStep('auth');
    };
    window.addEventListener('tos-accepted', onAccepted);
    return () => window.removeEventListener('tos-accepted', onAccepted);
  }, []);

  useEffect(() => {
    if (user && (step === 'auth' || step === 'language' || step === 'terms')) {
      setStep('dashboard');
    }
    if (!user && step !== 'language' && step !== 'terms' && step !== 'auth') {
      setStep('auth');
    }
  }, [user, step]);

  const selectLanguage = (language: Language) => {
    setLang(language);
    setStep('terms');
  };

  if (authLoading && step === 'auth') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-amethyst/30 blur-3xl rounded-full animate-glow" />
            <FarsVpnLogo className="relative w-16 h-16 animate-float" />
          </div>
          <p className="text-sm text-lavenderDim">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col selection:bg-amethyst/30 selection:text-white">
      <div className="flex-1 min-h-0">
        {step === 'language' && <LanguageSelect onSelect={selectLanguage} />}
        {step === 'terms' && <TermsGate />}
        {step === 'auth' && <AuthScreen />}
        {step === 'dashboard' && (
          <Dashboard
            onNavigateSettings={() => setStep('settings')}
            onNavigateHistory={() => setStep('history')}
            onNavigateAdmin={() => setStep('admin')}
          />
        )}
        {step === 'settings' && <Settings onBack={() => setStep('dashboard')} />}
        {step === 'history' && <HistoryPage onBack={() => setStep('dashboard')} />}
        {step === 'admin' && <AdminPanel onBack={() => setStep('dashboard')} />}
      </div>
      {step !== 'language' && (
        <button
          onClick={() => { setLang(lang === 'en' ? 'fa' : 'en'); }}
          className="fixed bottom-16 start-4 z-30 px-3 py-2 rounded-lg glass text-[10px] text-lavenderDim hover:text-lavender transition-colors"
        >
          {lang === 'en' ? 'فارسی' : 'English'}
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </I18nProvider>
  );
}

export default App;
