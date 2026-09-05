import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, LockKeyhole } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { ToSContent } from '@/components/ToSContent';

export function TermsGate() {
  const { t, lang, dir } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setHasScrolled(el.scrollTop + el.clientHeight >= el.scrollHeight - 30);
  };

  return (
    <div className="h-full flex items-center justify-center p-4 pt-6 overflow-y-auto">
      <div className="w-full max-w-2xl animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-amethyst/15 border border-amethyst/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amethyst" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-lavender">{t('tosTitle')}</h1>
            <p className="text-xs text-lavenderDim mt-0.5">{t('tosSub')}</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="relative">
            {!hasScrolled && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-charcoal/95 to-transparent z-10 pointer-events-none flex items-end justify-center pb-2">
                <span className="flex items-center gap-1.5 text-[11px] text-amethyst animate-bounce">
                  <ChevronDown className="w-3.5 h-3.5" />
                  {t('scrollToAccept')}
                </span>
              </div>
            )}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              dir={dir}
              className="h-[40vh] min-h-[260px] overflow-y-auto p-5 sm:p-7"
            >
              <ToSContent lang={lang} />
            </div>
          </div>

          <div className="border-t border-white/5 p-5 sm:p-6 space-y-4 bg-charcoal/30">
            <label className={`flex items-start gap-3 cursor-pointer group ${!hasScrolled ? 'opacity-40 pointer-events-none' : ''}`}>
              <span className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-md border flex items-center justify-center transition-all ${agreed ? 'bg-amethyst border-amethyst shadow-lg shadow-amethyst/30' : 'border-lavenderDim/40 group-hover:border-amethyst'}`}>
                {agreed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" disabled={!hasScrolled} />
              <span className="text-sm text-lavenderDim leading-relaxed">{t('iAgree')}</span>
            </label>
            <button
              disabled={!hasScrolled || !agreed}
              onClick={() => {
                localStorage.setItem('farsvpn_tos_accepted', 'true');
                window.dispatchEvent(new CustomEvent('tos-accepted'));
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-amethyst text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-amethyst/20 transition-all duration-300 active:scale-[0.98]"
            >
              {t('acceptContinue')}
              {lang === 'fa' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-lavenderDim">
              <LockKeyhole className="w-3 h-3" />
              <span>FarsVPN · Last updated August 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
