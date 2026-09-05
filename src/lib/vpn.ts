import { registerPlugin } from '@capacitor/core';

export interface FarsVpnPlugin {
  prepareVpn(): Promise<{ prepared: boolean }>;
  connect(options: {
    privateKey: string;
    publicKey: string;
    endpoint: string;
    address: string;
    dns: string[];
  }): Promise<{ connected: boolean }>;
  disconnect(): Promise<{ disconnected: boolean }>;
  getStatus(): Promise<{ connected: boolean }>;
  checkStatus(): Promise<{ connected: boolean }>;
  ping(options: { host: string; port?: number; timeout?: number }): Promise<{ latency: number }>;
  googleSignIn(): Promise<{ idToken: string }>;
}

export const FarsVpn = registerPlugin<FarsVpnPlugin>('FarsVpn');