import { Globe, ShieldCheck, Zap } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import type { Language } from '@/i18n/translations';
import { FarsVpnLogo } from '@/components/FarsVpnLogo';

interface LanguageSelectProps {
  onSelect: (lang: Language) => void;
}

export function LanguageSelect({ onSelect }: LanguageSelectProps) {
  const { t } = useI18n();

  return (
    <div className="h-full flex items-center justify-center p-6 pt-6 overflow-y-auto">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amethyst/30 blur-3xl rounded-full animate-glow" />
            <FarsVpnLogo className="relative w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold gradient-text neon-text">{t('appName')}</h1>
          <p className="text-sm text-lavenderDim mt-2">{t('tagline')}</p>
        </div>

        {/* Language selection card */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-lavender">
            <Globe className="w-5 h-5 text-amethyst" />
            <h2 className="font-semibold">{t('selectLanguage')}</h2>
          </div>
          <p className="text-xs text-lavenderDim -mt-2">{t('selectLanguageSub')}</p>

          <div className="space-y-3">
            <button
              onClick={() => onSelect('en')}
              className="w-full group flex items-center justify-between p-4 rounded-xl bg-charcoalLight/50 border border-white/5 hover:border-amethyst/40 transition-all duration-300 hover:shadow-lg hover:shadow-amethyst/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-amethyst/20 flex items-center justify-center text-lg">
                  🇬🇧
                </div>
                <div className="text-start">
                  <p className="font-semibold text-lavender">English</p>
                  <p className="text-xs text-lavenderDim">Continue in English</p>
                </div>
              </div>
              <Zap className="w-4 h-4 text-lavenderDim group-hover:text-amethyst transition-colors" />
            </button>

            <button
              onClick={() => onSelect('fa')}
              className="w-full group flex items-center justify-between p-4 rounded-xl bg-charcoalLight/50 border border-white/5 hover:border-amethyst/40 transition-all duration-300 hover:shadow-lg hover:shadow-amethyst/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-amethyst/20 flex items-center justify-center text-lg">
                  🇮🇷
                </div>
                <div className="text-start">
                  <p className="font-semibold text-lavender">فارسی</p>
                  <p className="text-xs text-lavenderDim">به فارسی ادامه دهید</p>
                </div>
              </div>
              <Zap className="w-4 h-4 text-lavenderDim group-hover:text-amethyst transition-colors" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-lavenderDim">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('secure')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
