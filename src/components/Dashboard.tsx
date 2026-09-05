import { useEffect, useState } from 'react';
import { Activity, ChevronDown, Clock3, History, LogOut, MapPin, RefreshCw, Settings, Shield, ShieldCheck, Signal, Timer, Wifi, X, Zap } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { FarsVpnLogo } from '@/components/FarsVpnLogo';

interface DashboardProps {
  onNavigateSettings: () => void;
  onNavigateHistory: () => void;
  onNavigateAdmin: () => void;
}

export function Dashboard({ onNavigateSettings, onNavigateHistory, onNavigateAdmin }: DashboardProps) {
  const { t, lang } = useI18n();
  const { platform, user, logout, servers, serversLoading, selectedServer, setSelectedServer, status, connect, disconnect, startAd, adCountdown, adProgress, sessionRemaining, sessionExpired, dismissSessionExpired, pings, refreshPing } = useApp();
  const [showProfile, setShowProfile] = useState(false);
  const [publicIp, setPublicIp] = useState<string>('—');
  const [ipLoading, setIpLoading] = useState<boolean>(false);
  const isConnected = status === 'connected';
  const isBusy = status === 'connecting' || status === 'ad_playing' || status === 'permission_pending';

  const fetchPublicIp = async () => {
    setIpLoading(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      if (data.ip) setPublicIp(data.ip);
    } catch {
      try {
        const res2 = await fetch('https://icanhazip.com/', { signal: AbortSignal.timeout(3000) });
        const text = await res2.text();
        if (text) setPublicIp(text.trim());
      } catch {
        setPublicIp('—');
      }
    } finally {
      setIpLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicIp();
  }, [status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };

  useEffect(() => {
    if (sessionExpired) {
      const timer = setTimeout(dismissSessionExpired, 6000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired, dismissSessionExpired]);

  return (
    <div className={`h-full flex flex-col pt-4 ${platform === 'desktop' ? 'px-6 lg:px-10' : 'px-4'}`}>
      <div className="max-w-5xl mx-auto w-full flex-1 min-h-0 flex flex-col">
        <header className="flex items-center justify-between py-3 mb-2 shrink-0">
          <div className="flex items-center gap-3">
            <FarsVpnLogo className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-lg text-lavender">{t('appName')}</h1>
              <p className="text-[10px] text-lavenderDim">{t('poweredBy')}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowProfile((v) => !v)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-charcoal/70 border border-white/5 hover:border-amethyst/30 transition-all">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName ?? user.email} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amethyst/20 flex items-center justify-center text-xs font-bold text-amethyst">{user?.mode === 'guest' ? 'G' : (user?.email[0]?.toUpperCase() ?? 'U')}</div>
              )}
              <span className="hidden sm:block text-xs text-lavenderDim max-w-28 truncate">{user?.mode === 'guest' ? t('guestSession') : user?.email}</span>
              <ChevronDown className="w-3.5 h-3.5 text-lavenderDim" />
            </button>
            {showProfile && (
              <div className="absolute end-0 top-full mt-2 w-48 z-20 glass-card p-2 animate-scale-in">
                <button onClick={() => { setShowProfile(false); onNavigateSettings(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-lavender hover:bg-amethyst/10 transition-colors">
                  <Settings className="w-3.5 h-3.5" />{t('navSettings')}
                </button>
                <button onClick={() => { setShowProfile(false); onNavigateHistory(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-lavender hover:bg-amethyst/10 transition-colors">
                  <History className="w-3.5 h-3.5" />{t('navHistory')}
                </button>
                {user?.isAdmin && (
                  <button onClick={() => { setShowProfile(false); onNavigateAdmin(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-amethyst hover:bg-amethyst/10 transition-colors">
                    <Shield className="w-3.5 h-3.5" />{t('navAdmin')}
                  </button>
                )}
                <div className="h-px bg-white/5 my-1" />
                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-error hover:bg-error/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />{t('backToLogin')}
                </button>
              </div>
            )}
          </div>
        </header>

        {sessionExpired && (
          <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-warning animate-slide-up">
            <div className="flex items-center gap-2 text-xs">
              <Timer className="w-4 h-4" />
              <span><strong>{t('sessionExpired')}:</strong> {t('sessionExpiredMsg')}</span>
            </div>
            <button onClick={dismissSessionExpired}><X className="w-4 h-4" /></button>
          </div>
        )}

        <main className={`flex-1 min-h-0 overflow-y-auto ${platform === 'desktop' ? 'lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start' : 'space-y-4'}`}>
          {/* Connection panel */}
          <section className={`glass-card p-5 sm:p-6 ${platform === 'desktop' ? 'lg:order-2' : ''}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-lavenderDim mb-1">{t('connectionStatus')}</p>
                <h2 className={`text-xl font-bold ${isConnected ? 'text-success' : isBusy ? 'text-warning' : 'text-lavender'}`}>
                  {isConnected ? t('connected') :
                   status === 'ad_playing' ? t('adPlaying') :
                   status === 'permission_pending' ? t('waitingPermission') :
                   status === 'connecting' ? t('connecting') : t('disconnected')}
                </h2>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${isConnected ? 'bg-success/10 text-success' : 'bg-white/5 text-lavenderDim'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-lavenderDim'}`} />
                {isConnected ? t('protected') : t('unprotected')}
              </div>
            </div>

            <div className="relative flex items-center justify-center py-4 sm:py-6">
              {isConnected && (
                <>
                  <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amethyst/30 animate-ripple" />
                  <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amethyst/20 animate-ripple" style={{ animationDelay: '0.7s' }} />
                </>
              )}
              <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-700 ${isConnected ? 'shadow-[0_0_60px_rgba(139,92,246,0.45)]' : 'shadow-[0_0_35px_rgba(139,92,246,0.15)]'}`}>
                <div className={`absolute inset-0 rounded-full border-2 ${isConnected ? 'border-success/70' : 'border-amethyst/50'}`} />
                <div className="absolute inset-2 rounded-full border border-amethyst/20 animate-orbit">
                  <span className={`absolute top-0 start-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isConnected ? 'bg-success shadow-lg shadow-success' : 'bg-amethyst shadow-lg shadow-amethyst'}`} />
                </div>
                <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${isConnected ? 'from-success/20 to-amethyst/20' : 'from-amethyst/25 to-transparent'} flex items-center justify-center transition-all`}>
                  <ShieldCheck className={`w-11 h-11 sm:w-14 sm:h-14 ${isConnected ? 'text-success' : 'text-amethyst'} transition-colors`} />
                </div>
                {isBusy && <div className="absolute inset-0 rounded-full border-2 border-warning border-t-transparent animate-spin" />}
              </div>
            </div>

            {isConnected ? (
              <div className="text-center space-y-1">
                <p className="text-xs text-lavenderDim">{t('timeRemaining')}</p>
                <p className="text-2xl font-mono font-bold text-lavender tracking-wider">{formatTime(sessionRemaining)}</p>
                <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-white/5 overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-amethyst to-success rounded-full transition-all" style={{ width: `${(sessionRemaining / (2 * 60 * 60)) * 100}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-lavenderDim">{selectedServer ? `${selectedServer} · ${t('iranIp')}` : t('selectServer')}</p>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isBusy) return;
                if (isConnected) {
                  disconnect();
                } else {
                  if (user?.mode === 'guest') {
                    startAd();
                  } else {
                    connect();
                  }
                }
              }}
              disabled={isBusy}
              className={`relative z-50 w-full mt-4 py-4 rounded-xl font-bold text-base text-white shadow-2xl transition-all ${
                isBusy
                  ? 'opacity-80 cursor-not-allowed bg-charcoal'
                  : isConnected
                    ? 'bg-error hover:bg-error/90 active:scale-95'
                    : 'gradient-amethyst hover:opacity-90 active:scale-95'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              {isBusy ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">
                    {status === 'ad_playing' ? t('adPlaying') :
                     status === 'permission_pending' ? t('waitingPermission') :
                     t('connecting')}
                  </span>
                </div>
              ) : (
                isConnected ? t('disconnect') : t('connect')
              )}
            </button>
          </section>

          {/* Server list */}
          <section className={platform === 'desktop' ? 'lg:order-1 space-y-5' : 'space-y-5'}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-amethyst mb-1">{t('selectServer')}</p>
                <h2 className="text-lg font-bold text-lavender">Iran Network</h2>
                <p className="text-xs text-lavenderDim mt-1">{t('selectServerSub')}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-success">
                <Activity className="w-3.5 h-3.5" />{t('online')}
              </div>
            </div>

            {serversLoading ? (
              <div className="glass-card p-8 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-amethyst border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {servers.map((server) => {
                  const active = selectedServer === server.id;
                  const ping = pings[server.id] ?? server.basePing;
                  const isComingSoon = server.comingSoon;
                  const isAvailable = server.online && !isComingSoon;

                  return (
                    <button
                      key={server.id}
                      onClick={() => !isConnected && isAvailable && setSelectedServer(server.id)}
                      disabled={isConnected || !isAvailable}
                      className={`relative w-full text-start p-4 rounded-2xl border transition-all duration-300 ${
                        active && isAvailable
                          ? 'bg-amethyst/10 border-amethyst/50 shadow-lg shadow-amethyst/10'
                          : 'glass-card border-white/5 hover:border-amethyst/30'
                      } ${isConnected ? 'cursor-default' : isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active && isAvailable ? 'bg-amethyst/20' : 'bg-white/5'}`}>
                            <Signal className={`w-5 h-5 ${active && isAvailable ? 'text-amethyst' : 'text-lavenderDim'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-lavender">{server.name}</p>
                              {isComingSoon && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                                  {t('comingSoon')}
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-[11px] text-lavenderDim mt-0.5">
                              <MapPin className="w-3 h-3" />{lang === 'fa' ? server.locationFa : server.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-end">
                            <p className="text-[10px] text-lavenderDim">{t('ping')}</p>
                            <p className={`text-sm font-mono font-semibold ${isComingSoon ? 'text-lavenderDim' : ping < 50 ? 'text-success' : 'text-warning'}`}>
                              {isComingSoon ? '—' : ping}<span className="text-[10px] font-normal ms-0.5">{isComingSoon ? '' : t('ms')}</span>
                            </p>
                          </div>
                          {!isComingSoon && (
                            <span
                              onClick={(e) => { e.stopPropagation(); refreshPing(server.id); }}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-lavenderDim" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isComingSoon ? 'bg-amber-500/40' : ping < 50 ? 'bg-success' : 'bg-warning'}`}
                            style={{ width: isComingSoon ? '15%' : `${Math.max(25, 100 - ping)}%` }}
                          />
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] ${isComingSoon ? 'text-amber-400/80' : server.online ? 'text-success' : 'text-error'}`}>
                          <span className={`w-1 h-1 rounded-full ${isComingSoon ? 'bg-amber-400' : server.online ? 'bg-success' : 'bg-error'}`} />
                          {isComingSoon ? t('comingSoon') : server.online ? t('online') : t('offline')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-[10px] text-lavenderDim">{t('secure')}</p>
                  <p className="text-xs text-lavender font-semibold">Active</p>
                </div>
              </div>
              <div className="glass-card p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amethyst/10 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-amethyst" />
                </div>
                <div>
                  <p className="text-[10px] text-lavenderDim">{t('yourIp')}</p>
                  <p className="text-xs text-lavender font-semibold font-mono">
                    {ipLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      publicIp
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {status === 'ad_playing' && <AdOverlay countdown={adCountdown} progress={adProgress} t={t} />}

        <footer className="flex items-center justify-center gap-2 mt-4 mb-2 shrink-0 text-[10px] text-lavenderDim/60">
          <Zap className="w-3 h-3 text-amethyst" />{t('poweredBy')}<span>·</span>{t('secure')}
        </footer>
      </div>

      {/* Bottom navigation */}
      <BottomNav onSettings={onNavigateSettings} onHistory={onNavigateHistory} onAdmin={onNavigateAdmin} />
    </div>
  );
}

function BottomNav({ onSettings, onHistory, onAdmin }: { onSettings: () => void; onHistory: () => void; onAdmin: () => void }) {
  const { t } = useI18n();
  const { user } = useApp();

  return (
    <div className="shrink-0 flex items-center justify-center gap-1 px-4 py-2 bg-obsidian/90 backdrop-blur-xl border-t border-amethyst/20">
      <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-lavenderDim">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[9px] font-medium">{t('navDashboard')}</span>
      </button>
      <button onClick={onHistory} className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-lavenderDim hover:text-lavender transition-colors">
        <History className="w-4 h-4" />
        <span className="text-[9px] font-medium">{t('navHistory')}</span>
      </button>
      {user?.isAdmin && (
        <button onClick={onAdmin} className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-lavenderDim hover:text-amethyst transition-colors">
          <Shield className="w-4 h-4" />
          <span className="text-[9px] font-medium">{t('navAdmin')}</span>
        </button>
      )}
      <button onClick={onSettings} className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-lavenderDim hover:text-lavender transition-colors">
        <Settings className="w-4 h-4" />
        <span className="text-[9px] font-medium">{t('navSettings')}</span>
      </button>
    </div>
  );
}

function AdOverlay({ countdown, progress, t }: { countdown: number; progress: number; t: (key: string) => string }) {
  return (
    <div className="fixed inset-0 z-40 bg-obsidian/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass-card p-6 text-center animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] uppercase tracking-widest text-lavenderDim">{t('adPlaying')}</span>
          <span className="text-xs text-amethyst font-mono">{countdown}s</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-8">
          <div className="h-full gradient-amethyst rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amethyst/30 to-amethyst/5 border border-amethyst/30 flex items-center justify-center mb-5">
          <Zap className="w-9 h-9 text-amethyst" />
        </div>
        <h3 className="text-lg font-bold text-lavender">{t('adPlaying')}</h3>
        <p className="text-xs text-lavenderDim mt-2">{t('adPlayingSub')}</p>
        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-success">
          <Clock3 className="w-3.5 h-3.5" />{t('adIn')} {countdown} {t('ms')}
        </div>
      </div>
    </div>
  );
}
