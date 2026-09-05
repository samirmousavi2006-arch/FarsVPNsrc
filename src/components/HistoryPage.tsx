import { ArrowLeft, ArrowRight, Clock, History, MapPin, Signal } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp, type ConnectionHistoryEntry } from '@/context/AppContext';

const SESSION_DURATION = 2 * 60 * 60;

interface HistoryPageProps {
  onBack: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const { t, lang } = useI18n();
  const { connectionHistory, platform } = useApp();
  const Arrow = lang === 'fa' ? ArrowLeft : ArrowRight;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const min = Math.floor(diff / 60000);
    if (min < 1) return t('historyJustNow');
    if (min < 60) return `${min} ${t('historyMinAgo')}`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours} ${t('historyHoursAgo')}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t('historyDaysAgo')}`;
  };

  const statusColor = (status: ConnectionHistoryEntry['status']) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'completed': return 'text-lavender bg-white/5';
      case 'disconnected': return 'text-warning bg-warning/10';
      case 'expired': return 'text-error bg-error/10';
      default: return 'text-lavenderDim bg-white/5';
    }
  };

  const statusLabel = (status: ConnectionHistoryEntry['status']) => {
    switch (status) {
      case 'active': return t('historyActive');
      case 'completed': return t('historyCompleted');
      case 'disconnected': return t('historyDisconnected');
      case 'expired': return t('historyExpired');
      default: return status;
    }
  };

  return (
    <div className={`h-full flex flex-col pt-4 ${platform === 'desktop' ? 'px-6 lg:px-10' : 'px-4'}`}>
      <div className="max-w-2xl mx-auto w-full flex-1 min-h-0 flex flex-col">
        <header className="flex items-center gap-3 py-3 mb-2 shrink-0">
          <button
            onClick={onBack}
            className="p-2 rounded-lg glass hover:border-amethyst/30 transition-all"
          >
            <Arrow className="w-4 h-4 text-lavender" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-lavender">{t('historyTitle')}</h1>
            <p className="text-xs text-lavenderDim mt-0.5">{t('historySub')}</p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        {connectionHistory.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-amethyst/10 border border-amethyst/20 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-amethyst" />
            </div>
            <h3 className="text-sm font-semibold text-lavender mb-1">{t('historyEmpty')}</h3>
            <p className="text-xs text-lavenderDim">{t('historyEmptySub')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectionHistory.map((entry, idx) => (
              <div
                key={entry.id}
                className="glass-card p-4 animate-slide-up"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amethyst/10 flex items-center justify-center">
                      <Signal className="w-5 h-5 text-amethyst" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-lavender">{entry.serverName}</p>
                      <p className="flex items-center gap-1 text-[11px] text-lavenderDim mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {t('iranIp')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColor(entry.status)}`}>
                    {statusLabel(entry.status)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-lavenderDim mb-1">{t('historyStarted')}</p>
                    <p className="text-xs text-lavender font-medium">{formatTimeAgo(entry.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-lavenderDim mb-1">{t('historyEnded')}</p>
                    <p className="text-xs text-lavender font-medium">
                      {entry.endedAt ? formatTimeAgo(entry.endedAt) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-lavenderDim mb-1">{t('historyDuration')}</p>
                    <p className="flex items-center gap-1 text-xs text-lavender font-medium">
                      <Clock className="w-3 h-3" />
                      {entry.endedAt ? formatTime(entry.durationSeconds) : formatTime(SESSION_DURATION)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
