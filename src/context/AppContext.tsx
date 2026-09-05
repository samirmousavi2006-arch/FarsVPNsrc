import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import type { Platform } from '@/i18n/translations';
import { DEFAULT_SERVERS, type ServerNode, type VpnConfig } from '@/i18n/translations';
import { FarsVpn } from '@/lib/vpn';
import {
  auth,
  db,
} from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

export type ConnectionStatus = 'disconnected' | 'permission_pending' | 'ad_pending' | 'ad_playing' | 'connecting' | 'connected';

export type AuthMode = 'guest' | 'authenticated';

export interface AuthUser {
  email: string;
  mode: AuthMode;
  uid: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
}

export interface ConnectionHistoryEntry {
  id: string;
  serverId: string;
  serverName: string;
  startedAt: number;
  endedAt: number | null;
  durationSeconds: number;
  status: 'active' | 'completed' | 'disconnected' | 'expired';
}

export interface SessionInfo {
  uid: string;
  email: string;
  serverId: string;
  status: string;
  startedAt: number;
  expiresAt: number;
}

export interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  isAdmin: boolean;
}

interface AppContextValue {
  platform: Platform;
  setPlatform: (p: Platform) => void;

  user: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  guestLogin: () => void;
  logout: () => Promise<void>;

  authError: string | null;
  clearAuthError: () => void;

  servers: ServerNode[];
  serversLoading: boolean;
  selectedServer: string | null;
  setSelectedServer: (s: string | null) => void;
  addServer: (server: Omit<ServerNode, 'online'>) => Promise<void>;
  getServerVpnConfig: (serverId: string) => VpnConfig | null;
  removeServer: (id: string) => Promise<void>;
  toggleServerStatus: (id: string) => Promise<void>;

  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  startAd: () => Promise<void>;

  adCountdown: number;
  adProgress: number;

  sessionRemaining: number;
  sessionTotal: number;
  sessionExpired: boolean;
  dismissSessionExpired: () => void;

  pings: Record<string, number>;
  refreshPing: (serverId: string) => void;

  connectionHistory: ConnectionHistoryEntry[];
  activeSessions: SessionInfo[];
  registeredUsers: RegisteredUser[];
}

const SESSION_DURATION = 2 * 60 * 60;
const AD_DURATION = 30;
const CONNECTING_DURATION = 3000;
const ADMIN_EMAIL = 'admin@farsvpn.local';

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('mobile');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [servers, setServers] = useState<ServerNode[]>(DEFAULT_SERVERS);
  const [serversLoading, setServersLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string | null>(DEFAULT_SERVERS[1].id);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isProcessing, setIsProcessing] = useState(false);
  const [adCountdown, setAdCountdown] = useState(AD_DURATION);
  const [adProgress, setAdProgress] = useState(0);
  const [sessionRemaining, setSessionRemaining] = useState(SESSION_DURATION);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [pings, setPings] = useState<Record<string, number>>({
    FarsVpn1: 42,
    FarsVpn2: 58,
  });
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistoryEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const currentSessionRef = useRef<ConnectionHistoryEntry | null>(null);
  const isAdMobInitialized = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach(clearInterval);
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  // Sync native VPN state on app load
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      FarsVpn.checkStatus()
        .then((res) => {
          console.log('Initial VPN status check:', res);
          if (res.connected) {
            setStatus('connected');
          }
        })
        .catch((err) => {
          console.error('Failed to sync VPN status on init:', err);
        });
    }
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const isAdmin = (fbUser.email ?? '') === ADMIN_EMAIL;
        setUser({
          email: fbUser.email ?? 'unknown@farsvpn.local',
          mode: 'authenticated',
          uid: fbUser.uid,
          displayName: fbUser.displayName ?? undefined,
          photoURL: fbUser.photoURL ?? undefined,
          isAdmin,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to servers collection from Firestore
  useEffect(() => {
    const q = query(collection(db, 'servers'));
    const unsubscribe = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setServers(DEFAULT_SERVERS);
      } else {
        const serverList: ServerNode[] = snap.docs.map((d) => {
          const data = d.data() as Partial<ServerNode>;
          const defaultServer = DEFAULT_SERVERS.find((s) => s.id === d.id);
          return {
            id: d.id,
            name: data.name ?? defaultServer?.name ?? d.id,
            location: data.location ?? defaultServer?.location ?? 'Unknown',
            locationFa: data.locationFa ?? defaultServer?.locationFa ?? data.location ?? 'نامشخص',
            basePing: data.basePing ?? defaultServer?.basePing ?? 50,
            online: defaultServer?.comingSoon ? false : (data.online ?? defaultServer?.online ?? true),
            comingSoon: defaultServer?.comingSoon ?? data.comingSoon ?? false,
            vpn: defaultServer ? defaultServer.vpn : (data.vpn ?? {
              address: '', port: 0, privateKey: '', publicKey: '', endpoint: '', dns: ['1.1.1.1'],
            }),
          };
        });
        setServers(serverList);
      }
      setServersLoading(false);
    }, () => {
      setServers(DEFAULT_SERVERS);
      setServersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to active sessions
  useEffect(() => {
    const q = query(collection(db, 'sessions'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const sessions: SessionInfo[] = snap.docs.map((d) => {
        const data = d.data() as SessionInfo;
        return { ...data, uid: d.id };
      });
      setActiveSessions(sessions);
    }, () => {
      setActiveSessions([]);
    });

    return () => unsubscribe();
  }, []);

  // Load registered users (admin only)
  useEffect(() => {
    if (!user?.isAdmin) {
      setRegisteredUsers([]);
      return;
    }

    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users: RegisteredUser[] = snap.docs.map((d) => {
          const data = d.data() as Partial<RegisteredUser>;
          return {
            uid: d.id,
            email: data.email ?? 'unknown',
            displayName: data.displayName ?? null,
            photoURL: data.photoURL ?? null,
            createdAt: data.createdAt ?? new Date().toISOString(),
            isAdmin: data.isAdmin ?? false,
          };
        });
        setRegisteredUsers(users);
      } catch {
        setRegisteredUsers([]);
      }
    };

    loadUsers();
  }, [user?.isAdmin]);

  // Load connection history for the current user
  useEffect(() => {
    if (!user || user.mode !== 'authenticated' || user.uid === 'guest') return;

    const q = query(
      collection(db, 'users', user.uid, 'history'),
      orderBy('startedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const history: ConnectionHistoryEntry[] = snap.docs.map((d) => {
        const data = d.data() as ConnectionHistoryEntry;
        return { ...data, id: d.id };
      });
      setConnectionHistory(history);
    }, () => {
      setConnectionHistory([]);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.mode]);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setAuthError(message);
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: email.split('@')[0] });
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          createdAt: new Date().toISOString(),
          isAdmin: false,
        });
      } catch {
        // ignore Firestore errors
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setAuthError(message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      let cred;
      if (Capacitor.isNativePlatform()) {
        const { idToken } = await FarsVpn.googleSignIn();
        cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      } else {
        const provider = new GoogleAuthProvider();
        cred = await signInWithPopup(auth, provider);
      }
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: cred.user.email ?? '',
          displayName: cred.user.displayName ?? '',
          photoURL: cred.user.photoURL ?? null,
          createdAt: new Date().toISOString(),
          isAdmin: (cred.user.email ?? '') === ADMIN_EMAIL,
        }, { merge: true });
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setAuthError(message);
      throw err;
    }
  };

  const guestLogin = () => {
    setUser({ email: 'guest@farsvpn.local', mode: 'guest', uid: 'guest' });
  };

  const saveSessionToFirestore = async (uid: string, serverId: string) => {
    try {
      const expiresAt = Date.now() + SESSION_DURATION * 1000;
      await setDoc(doc(db, 'sessions', uid), {
        uid,
        email: user?.email ?? '',
        serverId,
        status: 'connected',
        startedAt: Date.now(),
        expiresAt,
        remainingSeconds: SESSION_DURATION,
      });
    } catch {
      // ignore
    }
  };

  const deleteSessionFromFirestore = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'sessions', uid));
    } catch {
      // ignore
    }
  };

  const saveHistoryEntry = async (uid: string, entry: Omit<ConnectionHistoryEntry, 'id'>): Promise<string | null> => {
    try {
      const docRef = await addDoc(collection(db, 'users', uid, 'history'), entry);
      return docRef.id;
    } catch {
      return null;
    }
  };

  const updateHistoryEntry = async (uid: string, entryId: string, updates: Partial<ConnectionHistoryEntry>) => {
    try {
      await updateDoc(doc(db, 'users', uid, 'history', entryId), updates);
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    const currentUser = user;
    clearTimers();
    setUser(null);
    setSelectedServer(null);
    setStatus('disconnected');
    setSessionRemaining(SESSION_DURATION);
    setSessionExpired(false);
    setAdCountdown(AD_DURATION);
    setAdProgress(0);
    setConnectionHistory([]);
    currentSessionRef.current = null;

    if (currentUser?.mode === 'authenticated' && currentUser.uid !== 'guest') {
      try {
        await deleteSessionFromFirestore(currentUser.uid);
      } catch (err) {
        console.warn('Delete session on logout failed:', err);
      }
    }

    try {
      if (currentUser?.mode !== 'guest') {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn('Firebase signout failed:', err);
    }
  };

  // Restore session from Firestore on app load
  useEffect(() => {
    if (!user || user.mode !== 'authenticated' || user.uid === 'guest') return;

    const restoreSession = async () => {
      try {
        const snap = await getDoc(doc(db, 'sessions', user.uid));
        if (snap.exists()) {
          const data = snap.data() as {
            serverId: string;
            expiresAt: number;
            status: string;
          };
          const remaining = Math.floor((data.expiresAt - Date.now()) / 1000);
          if (remaining > 0 && data.status === 'connected') {
            setSelectedServer(data.serverId);
            setSessionRemaining(remaining);
            setStatus('connected');
            startSessionTimer(remaining);
          } else {
            await deleteDoc(doc(db, 'sessions', user.uid));
            setSessionExpired(true);
          }
        }
      } catch {
        // ignore
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const startSessionTimer = (duration?: number) => {
    if (duration) setSessionRemaining(duration);
    const timer = setInterval(() => {
      setSessionRemaining((prev) => {
        if (prev <= 1) {
          clearTimers();
          setStatus('disconnected');
          setSessionExpired(true);
          if (user?.uid && user.uid !== 'guest') {
            deleteSessionFromFirestore(user.uid);
            if (currentSessionRef.current) {
              updateHistoryEntry(user.uid, currentSessionRef.current.id, {
                status: 'expired',
                endedAt: Date.now(),
                durationSeconds: SESSION_DURATION,
              });
            }
          }
          return 0;
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);
    timersRef.current.push(timer);
  };

  const handleConnected = async () => {
    console.log('Finalizing connection...');
    if (Capacitor.isNativePlatform() && selectedServer) {
      const server = servers.find((s) => s.id === selectedServer);
      if (!server || !server.vpn.privateKey || !server.vpn.publicKey) {
        console.error('Server config invalid:', JSON.stringify(server));
        setStatus('disconnected');
        return;
      }
      try {
        console.log('Calling native connect with endpoint:', server.vpn.endpoint);
        const result = await FarsVpn.connect({
          privateKey: server.vpn.privateKey,
          publicKey: server.vpn.publicKey,
          endpoint: server.vpn.endpoint || `${server.vpn.address.split('/')[0]}:${server.vpn.port}`,
          address: server.vpn.address,
          dns: server.vpn.dns || ['1.1.1.1', '8.8.8.8'],
        });
        console.log('Native connect result:', JSON.stringify(result));
      } catch (e) {
        console.error('Native connection failed. Error Details:', {
          message: e instanceof Error ? e.message : 'Unknown error',
          error: e,
          timestamp: new Date().toISOString(),
          serverId: selectedServer
        });
        setStatus('disconnected');
        return;
      }
    }

    setStatus('connected');
    startSessionTimer();
    if (user?.uid && user.uid !== 'guest' && selectedServer) {
      saveSessionToFirestore(user.uid, selectedServer);
      const server = servers.find((s) => s.id === selectedServer);
      const entry: Omit<ConnectionHistoryEntry, 'id'> = {
        serverId: selectedServer,
        serverName: server?.name ?? selectedServer,
        startedAt: Date.now(),
        endedAt: null,
        durationSeconds: 0,
        status: 'active',
      };
      saveHistoryEntry(user.uid, entry).then((entryId) => {
        if (entryId) {
          currentSessionRef.current = { ...entry, id: entryId };
        }
      });
    }
  };

  const connect = async () => {
    if (isProcessing) {
      console.warn('Connection request ignored: Already processing');
      return;
    }
    setIsProcessing(true);
    try {
      console.log('CONNECT TRIGGERED');

      if (Capacitor.isNativePlatform()) {
        setStatus('permission_pending');
        await FarsVpn.prepareVpn();
      }

      setStatus('connecting');
      await handleConnected();
    } catch (err) {
      console.error('Connect error:', err);
      setStatus('disconnected');
    } finally {
      setIsProcessing(false);
    }
  };

  const startAd = async () => {
    console.log('Starting Ad flow...');
    if (status !== 'disconnected' || isProcessing) return;

    setIsProcessing(true);
    try {
      if (Capacitor.isNativePlatform()) {
        setStatus('permission_pending');
        console.log('Preparing VPN...');
        await FarsVpn.prepareVpn();
      }
    } catch (e) {
      console.warn('VPN Permission denied or error', e);
      setStatus('disconnected');
      setIsProcessing(false);
      return;
    }

    setStatus('ad_playing');
    setAdCountdown(AD_DURATION);
    setAdProgress(0);

    let adTimer: ReturnType<typeof setInterval> | null = null;
    let completed = false;

    const finishAdFlow = async () => {
      if (completed) return;
      completed = true;
      if (adTimer) clearInterval(adTimer);
      setStatus('connecting');
      await handleConnected();
      setIsProcessing(false);
    };

    // Start 30-second UI countdown timer as guaranteed experience
    adTimer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          finishAdFlow();
          return 0;
        }
        return prev - 1;
      });
      setAdProgress((prev) => Math.min(100, prev + (100 / AD_DURATION)));
    }, 1000);
    timersRef.current.push(adTimer);

    if (Capacitor.isNativePlatform()) {
      try {
        if (!isAdMobInitialized.current) {
          console.log('Initializing AdMob...');
          await AdMob.initialize({ initializeForTesting: false }).catch(() => {});
          isAdMobInitialized.current = true;
        }

        const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          console.log('AdMob Dismissed - proceeding to connect');
          dismissListener.remove();
          finishAdFlow();
        });

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          console.log('AdMob Reward earned');
          rewardListener.remove();
        });

        console.log('Preparing Rewarded Ad:', 'ca-app-pub-6413679703557985/2095152588');
        await AdMob.prepareRewardVideoAd({
          adId: 'ca-app-pub-6413679703557985/2095152588'
        });
        await AdMob.showRewardVideoAd();

      } catch (error) {
        console.warn('AdMob video unavailable or warming up, 30s countdown active:', error);
        // Do not abort ad flow; let the 30-second overlay timer finish
      }
    }
  };

  const disconnect = async () => {
    if (isProcessing) {
      console.warn('Disconnect request ignored: Already processing');
      return;
    }
    setIsProcessing(true);
    try {
      clearTimers();
      if (Capacitor.isNativePlatform()) {
        await FarsVpn.disconnect().catch((err) => {
          console.error('Native disconnect failed:', err);
        });
      }
      setStatus('disconnected');
      setSessionRemaining(SESSION_DURATION);
      setAdCountdown(AD_DURATION);
      setAdProgress(0);
      if (user?.uid && user.uid !== 'guest') {
        deleteSessionFromFirestore(user.uid);
        if (currentSessionRef.current) {
          updateHistoryEntry(user.uid, currentSessionRef.current.id, {
            status: 'disconnected',
            endedAt: Date.now(),
            durationSeconds: SESSION_DURATION - sessionRemaining,
          });
          currentSessionRef.current = null;
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const dismissSessionExpired = () => setSessionExpired(false);
  const clearAuthError = () => setAuthError(null);

  const refreshPing = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (!server) return;

    if (!Capacitor.isNativePlatform()) {
      setPings((prev) => ({ ...prev, [serverId]: server.basePing }));
      return;
    }

    const host = server.vpn.endpoint ? server.vpn.endpoint.split(':')[0] : server.vpn.address.split('/')[0];
    const port = server.vpn.endpoint ? parseInt(server.vpn.endpoint.split(':')[1]) : server.vpn.port;

    console.log(`Pinging ${host}:${port}...`);
    FarsVpn.ping({ host, port, timeout: 2000 })
      .then((res) => {
        console.log(`Ping result for ${serverId}:`, JSON.stringify(res));
        setPings((prev) => ({ ...prev, [serverId]: res.latency }));
      })
      .catch((err) => {
        console.error(`Ping failed for ${serverId}:`, JSON.stringify(err));
        setPings((prev) => ({ ...prev, [serverId]: 999 }));
      });
  };

  // Auto-refresh pings periodically
  useEffect(() => {
    for (const server of servers) refreshPing(server.id);
    const timer = setInterval(() => {
      for (const server of servers) refreshPing(server.id);
    }, 5000);
    return () => clearInterval(timer);
  }, [servers]);

  // Server management (admin)
  const addServer = async (server: Omit<ServerNode, 'online'>) => {
    try {
      await setDoc(doc(db, 'servers', server.id), {
        name: server.name,
        location: server.location,
        locationFa: server.locationFa,
        basePing: server.basePing,
        online: true,
        vpn: server.vpn,
      });
    } catch {
      // ignore
    }
  };

  const getServerVpnConfig = (serverId: string): VpnConfig | null => {
    const server = servers.find((s) => s.id === serverId);
    return server?.vpn ?? null;
  };

  const removeServer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'servers', id));
    } catch {
      // ignore
    }
  };

  const toggleServerStatus = async (id: string) => {
    const server = servers.find((s) => s.id === id);
    if (!server) return;
    try {
      await updateDoc(doc(db, 'servers', id), { online: !server.online });
    } catch {
      // ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        platform,
        setPlatform,
        user,
        authLoading,
        login,
        signup,
        loginWithGoogle,
        guestLogin,
        logout,
        authError,
        clearAuthError,
        servers,
        serversLoading,
        selectedServer,
        setSelectedServer,
        addServer,
        removeServer,
        toggleServerStatus,
        getServerVpnConfig,
        status,
        connect,
        disconnect,
        startAd,
        adCountdown,
        adProgress,
        sessionRemaining,
        sessionTotal: SESSION_DURATION,
        sessionExpired,
        dismissSessionExpired,
        pings,
        refreshPing,
        connectionHistory,
        activeSessions,
        registeredUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}