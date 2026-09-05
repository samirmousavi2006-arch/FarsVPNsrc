import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Server, Shield, Signal, Trash2, Users, Wifi } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { parseVlessUrl } from '@/lib/vless';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { t, lang } = useI18n();
  const {
    user,
    servers,
    serversLoading,
    activeSessions,
    registeredUsers,
    addServer,
    removeServer,
    toggleServerStatus,
    platform,
  } = useApp();
  const Arrow = lang === 'fa' ? ArrowLeft : ArrowRight;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServer, setNewServer] = useState({
    id: '',
    name: '',
    location: '',
    locationFa: '',
    basePing: 50,
    vlessUrl: '',
  });

  if (!user?.isAdmin) {
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
            <h1 className="text-xl font-bold text-lavender">{t('adminTitle')}</h1>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="glass-card p-10 flex flex-col items-center text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-sm font-semibold text-lavender mb-1">{t('adminAccessDenied')}</h3>
            <p className="text-xs text-lavenderDim">{t('adminAccessDeniedSub')}</p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const onlineCount = servers.filter((s) => s.online).length;

  const handleAddServer = async () => {
    const vless = parseVlessUrl(newServer.vlessUrl.trim());
    if (!newServer.id.trim() || !newServer.name.trim() || !vless) return;
    await addServer({
      id: newServer.id.trim(),
      name: newServer.name.trim(),
      location: newServer.location.trim() || 'Unknown',
      locationFa: newServer.locationFa.trim() || newServer.location.trim(),
      basePing: newServer.basePing,
      vless,
    });
    setNewServer({ id: '', name: '', location: '', locationFa: '', basePing: 50, vlessUrl: '' });
    setShowAddForm(false);
  };

  return (
    <div className={`h-full flex flex-col pt-4 ${platform === 'desktop' ? 'px-6 lg:px-10' : 'px-4'}`}>
      <div className="max-w-3xl mx-auto w-full flex-1 min-h-0 flex flex-col">
        <header className="flex items-center gap-3 py-3 mb-2 shrink-0">
          <button
            onClick={onBack}
            className="p-2 rounded-lg glass hover:border-amethyst/30 transition-all"
          >
            <Arrow className="w-4 h-4 text-lavender" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-lavender">{t('adminTitle')}</h1>
            <p className="text-xs text-lavenderDim mt-0.5">{t('adminSub')}</p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-4 flex items-center gap-3 animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-amethyst/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-amethyst" />
            </div>
            <div>
              <p className="text-[10px] text-lavenderDim">{t('adminTotalServers')}</p>
              <p className="text-lg font-bold text-lavender">{servers.length}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-lavenderDim">{t('adminOnlineServers')}</p>
              <p className="text-lg font-bold text-success">{onlineCount}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-lavenderDim">{t('adminSessions')}</p>
              <p className="text-lg font-bold text-warning">{activeSessions.length}</p>
            </div>
          </div>
        </div>

        {/* Servers management */}
        <div className="glass-card p-5 mb-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amethyst" />
              <h2 className="text-sm font-semibold text-lavender">{t('adminServers')}</h2>
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amethyst/10 border border-amethyst/20 text-xs font-medium text-amethyst hover:bg-amethyst/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('adminAddServer')}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-4 p-4 rounded-xl bg-obsidian/60 border border-white/5 animate-scale-in">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  value={newServer.id}
                  onChange={(e) => setNewServer((s) => ({ ...s, id: e.target.value }))}
                  placeholder={t('adminServerName')}
                  className="bg-charcoal/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/40"
                />
                <input
                  value={newServer.name}
                  onChange={(e) => setNewServer((s) => ({ ...s, name: e.target.value }))}
                  placeholder={t('adminServerName')}
                  className="bg-charcoal/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/40"
                />
                <input
                  value={newServer.location}
                  onChange={(e) => setNewServer((s) => ({ ...s, location: e.target.value }))}
                  placeholder={t('adminServerLocation')}
                  className="bg-charcoal/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/40"
                />
                <input
                  value={newServer.locationFa}
                  onChange={(e) => setNewServer((s) => ({ ...s, locationFa: e.target.value }))}
                  placeholder={t('adminServerLocationFa')}
                  className="bg-charcoal/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/40"
                />
                <input
                  type="number"
                  value={newServer.basePing}
                  onChange={(e) => setNewServer((s) => ({ ...s, basePing: parseInt(e.target.value) || 50 }))}
                  placeholder={t('adminServerPing')}
                  className="bg-charcoal/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/40"
                />
                <input
                  value={newServer.vlessUrl}
                  onChange={(e) => setNewServer((s) => ({ ...s, vlessUrl: e.target.value }))}
                  placeholder="vless://..."
                  className="col-span-2 bg-charcoal/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-lavender placeholder:text-lavenderDim/50 outline-none focus:border-amethyst/40"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddServer}
                  className="flex-1 py-2.5 rounded-lg gradient-amethyst text-white text-xs font-semibold hover:shadow-lg hover:shadow-amethyst/20 transition-all"
                >
                  {t('adminSave')}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-white/10 text-xs font-medium text-lavenderDim hover:text-lavender transition-all"
                >
                  {t('adminCancel')}
                </button>
              </div>
            </div>
          )}

          {serversLoading ? (
            <p className="text-xs text-lavenderDim text-center py-4">{t('loading')}</p>
          ) : (
            <div className="space-y-2">
              {servers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-obsidian/40 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${server.online ? 'bg-success/10' : 'bg-error/10'}`}>
                      <Signal className={`w-4 h-4 ${server.online ? 'text-success' : 'text-error'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-lavender">{server.name}</p>
                      <p className="text-[11px] text-lavenderDim">{lang === 'fa' ? server.locationFa : server.location} · {server.basePing}{t('ms')}</p>
                      <p className="text-[10px] text-amethyst/80 font-mono">{server.vless.address}:{server.vless.port} · {server.vless.network.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleServerStatus(server.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${server.online ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-error/10 text-error hover:bg-error/20'}`}
                    >
                      {server.online ? t('adminServerOnline') : t('adminServerOffline')}
                    </button>
                    <button
                      onClick={() => removeServer(server.id)}
                      className="p-1.5 rounded-lg text-lavenderDim hover:text-error hover:bg-error/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="glass-card p-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-4 h-4 text-amethyst" />
            <h2 className="text-sm font-semibold text-lavender">{t('adminSessions')}</h2>
          </div>
          {activeSessions.length === 0 ? (
            <div className="flex flex-col items-center text-center py-6">
              <Wifi className="w-8 h-8 text-lavenderDim/30 mb-2" />
              <p className="text-xs text-lavenderDim">{t('adminNoSessions')}</p>
              <p className="text-[11px] text-lavenderDim/60">{t('adminNoSessionsSub')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSessions.map((session) => {
                const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
                const h = Math.floor(remaining / 3600);
                const m = Math.floor((remaining % 3600) / 60);
                return (
                  <div key={session.uid} className="flex items-center justify-between p-3 rounded-xl bg-obsidian/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amethyst/20 flex items-center justify-center text-xs font-bold text-amethyst">
                        {session.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-lavender truncate max-w-32">{session.email}</p>
                        <p className="text-[11px] text-lavenderDim">{session.serverId}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        {t('historyActive')}
                      </span>
                      <p className="text-[10px] text-lavenderDim mt-1 font-mono">{h}h {m}m {t('timeRemaining')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registered Users */}
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-amethyst" />
            <h2 className="text-sm font-semibold text-lavender">{t('adminUsers')}</h2>
          </div>
          {registeredUsers.length === 0 ? (
            <div className="flex flex-col items-center text-center py-6">
              <Users className="w-8 h-8 text-lavenderDim/30 mb-2" />
              <p className="text-xs text-lavenderDim">{t('adminNoUsers')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registeredUsers.map((u) => (
                <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl bg-obsidian/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.email} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amethyst/20 flex items-center justify-center text-xs font-bold text-amethyst">
                        {u.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-lavender truncate max-w-40">{u.email}</p>
                      <p className="text-[11px] text-lavenderDim">
                        {new Date(u.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {u.isAdmin && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amethyst/20 text-amethyst">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
