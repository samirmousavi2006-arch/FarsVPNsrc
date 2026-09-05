import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Globe, Info, LogOut, Mail, Monitor, Shield, User } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { FarsVpnLogo } from '@/components/FarsVpnLogo';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { t, lang, setLang } = useI18n();
  const { user, logout, platform } = useApp();
  const [showSignOut, setShowSignOut] = useState(false);
  const Arrow = lang === 'fa' ? ArrowLeft : ArrowRight;

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className={`h-full flex flex-col pt-4 ${platform === 'desktop' ? 'px-6 lg:px-10' : 'px-4'}`}>
      <div className="max-w-2xl mx-auto w-full flex-1 min-h-0 flex flex-col">
        <header className="flex items-center justify-between py-3 mb-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg glass hover:border-amethyst/30 transition-all"
            >
              <Arrow className="w-4 h-4 text-lavender" />
            </button>
            <h1 className="text-xl font-bold text-lavender">{t('settingsTitle')}</h1>
          </div>
          <FarsVpnLogo className="w-9 h-9" />
        </header>

        <p className="text-sm text-lavenderDim mb-4 shrink-0">{t('settingsSub')}</p>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4">
        {/* Account section */}
        <div className="glass-card p-5 mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-amethyst" />
            <h2 className="text-sm font-semibold text-lavender">{t('settingsAccount')}</h2>
          </div>

          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? user.email}
                className="w-14 h-14 rounded-full border-2 border-amethyst/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-amethyst/20 flex items-center justify-center text-lg font-bold text-amethyst border-2 border-amethyst/30">
                {user?.mode === 'guest' ? 'G' : (user?.email?.[0]?.toUpperCase() ?? 'U')}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-lavender truncate">
                {user?.mode === 'guest' ? t('guestSession') : (user?.displayName ?? user?.email)}
              </p>
              <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${user?.isAdmin ? 'bg-amethyst/20 text-amethyst' : user?.mode === 'guest' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                <Shield className="w-3 h-3" />
                {user?.isAdmin ? 'Admin' : user?.mode === 'guest' ? t('accountTypeGuest') : t('accountTypeUser')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-lavenderDim">
                <Mail className="w-3.5 h-3.5" />
                {t('accountEmail')}
              </span>
              <span className="text-xs text-lavender font-medium truncate max-w-48">{user?.email}</span>
            </div>
            {user?.mode === 'authenticated' && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-lavenderDim">
                  <User className="w-3.5 h-3.5" />
                  {t('accountUid')}
                </span>
                <span className="text-xs text-lavender font-mono truncate max-w-48">{user.uid.slice(0, 16)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Preferences section */}
        <div className="glass-card p-5 mb-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-amethyst" />
            <h2 className="text-sm font-semibold text-lavender">{t('settingsPreferences')}</h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-lavenderDim mb-2">{t('changeLanguage')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLang('en')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${lang === 'en' ? 'bg-amethyst/20 text-lavender border border-amethyst/40' : 'bg-obsidian/60 text-lavenderDim border border-white/5 hover:border-amethyst/20'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('fa')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${lang === 'fa' ? 'bg-amethyst/20 text-lavender border border-amethyst/40' : 'bg-obsidian/60 text-lavenderDim border border-white/5 hover:border-amethyst/20'}`}
                >
                  فارسی
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="flex items-center gap-2 text-xs text-lavenderDim">
                <Monitor className="w-3.5 h-3.5" />
                {t('platformSwitcher')}
              </span>
              <span className="text-xs text-lavender font-medium">{platform === 'mobile' ? t('mobileView') : t('desktopView')}</span>
            </div>
          </div>
        </div>

        {/* About section */}
        <div className="glass-card p-5 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-amethyst" />
            <h2 className="text-sm font-semibold text-lavender">{t('settingsAbout')}</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-lavenderDim">{t('appVersion')}</span>
            <span className="text-xs text-lavender font-mono">{t('versionNumber')}</span>
          </div>
        </div>

        {/* Sign out */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 rounded-2xl glass-card border-error/10 hover:border-error/30 transition-all group"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium text-error">
              <LogOut className="w-4 h-4" />
              {t('signOut')}
            </span>
            <ChevronRight className="w-4 h-4 text-error/50 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
