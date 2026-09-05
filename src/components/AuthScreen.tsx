import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { FarsVpnLogo } from '@/components/FarsVpnLogo';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AuthScreen() {
  const { t, lang } = useI18n();
  const { login, signup, loginWithGoogle, guestLogin, authError, clearAuthError } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLogin = mode === 'login';
  const Arrow = lang === 'fa' ? ArrowLeft : ArrowRight;
  const error = authError || localError;

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    setLocalError(null);
    clearAuthError();
  };

  const handleGoogle = async () => {
    setLocalError(null);
    clearAuthError();
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      let clean = message;
      if (message.includes('auth/popup-closed-by-user')) {
        clean = 'Sign-in cancelled';
      } else if (message.includes('auth/popup-blocked')) {
        clean = 'Popup blocked — allow popups for this site';
      } else if (message.includes('auth/network-request-failed')) {
        clean = 'Network error — check your connection';
      }
      setLocalError(clean);
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLocalError(null);
    clearAuthError();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      // Clean up common Firebase error messages for the user
      let clean = message;
      if (message.includes('auth/invalid-credential')) {
        clean = isLogin ? 'Invalid email or password' : 'Could not create account';
      } else if (message.includes('auth/email-already-in-use')) {
        clean = 'This email is already registered';
      } else if (message.includes('auth/weak-password')) {
        clean = 'Password should be at least 6 characters';
      } else if (message.includes('auth/invalid-email')) {
        clean = 'Please enter a valid email address';
      } else if (message.includes('auth/network-request-failed')) {
        clean = 'Network error — check your connection';
      } else if (message.includes('auth/configuration-not-found')) {
        clean = 'Authentication not configured. Enable Email/Password in your Firebase console.';
      } else if (message.includes('auth/api-key-not-valid')) {
        clean = 'Invalid Firebase API key. Check your firebase config.';
      }
      setLocalError(clean);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <FarsVpnLogo className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-lavender">{isLogin ? t('welcomeBack') : t('createAccount')}</h1>
          <p className="text-sm text-lavenderDim mt-2">{t('authSub')}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex p-1 rounded-xl bg-obsidian/60 border border-white/5 mb-6">
            <button onClick={() => switchMode('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-amethyst/20 text-lavender shadow-sm' : 'text-lavenderDim hover:text-lavender'}`}>
              {t('login')}
            </button>
            <button onClick={() => switchMode('signup')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-amethyst/20 text-lavender shadow-sm' : 'text-lavenderDim hover:text-lavender'}`}>
              {t('signup')}
            </button>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-error/10 border border-error/20 text-xs text-error animate-fade-in">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>{isLogin ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-lavenderDim uppercase tracking-wider">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-lavenderDim mb-2">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lavenderDim" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={t('enterEmail')}
                  className="w-full bg-obsidian/60 border border-white/10 rounded-xl py-3 ps-10 pe-3 text-sm text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/60 focus:ring-2 focus:ring-amethyst/10 transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-lavenderDim mb-2">{t('password')}</label>
              <div className="relative">
                <LockKeyhole className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lavenderDim" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('enterPassword')}
                  className="w-full bg-obsidian/60 border border-white/10 rounded-xl py-3 ps-10 pe-10 text-sm text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/60 focus:ring-2 focus:ring-amethyst/10 transition-all"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-lavenderDim hover:text-lavender transition-colors" disabled={loading}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <p className="text-[11px] text-lavenderDim/70 flex items-center gap-1.5">
                <UserRound className="w-3 h-3" /> Create a secure account to save your preferences
              </p>
            )}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-amethyst text-white font-semibold text-sm hover:shadow-xl hover:shadow-amethyst/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isLogin ? t('login') : t('signup')}...</span>
                </>
              ) : (
                <>
                  {isLogin ? t('login') : t('signup')} <Arrow className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-lavenderDim uppercase tracking-wider">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <button
            onClick={guestLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-white/10 text-sm font-medium text-lavenderDim hover:text-lavender hover:border-amethyst/40 transition-all disabled:opacity-50"
          >
            {t('guestSession')}
          </button>
          <p className="text-center text-[10px] text-lavenderDim/70 mt-3">{t('guestNote')}</p>
        </div>
      </div>
    </div>
  );
}
