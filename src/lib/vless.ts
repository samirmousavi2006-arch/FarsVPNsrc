import type { VlessConfig } from '@/i18n/translations';

export function buildVlessUrl(vless: VlessConfig, name: string): string {
  const params = new URLSearchParams();
  if (vless.security) params.set('security', vless.security);
  if (vless.encryption) params.set('encryption', vless.encryption);
  if (vless.network) params.set('type', vless.network);
  if (vless.path) params.set('path', vless.path);
  if (vless.host) params.set('host', vless.host);
  if (vless.flow) params.set('flow', vless.flow);
  if (vless.sni) params.set('sni', vless.sni);

  return `vless://${vless.uuid}@${vless.address}:${vless.port}?${params.toString()}#${name}`;
}

export function parseVlessUrl(url: string): VlessConfig | null {
  try {
    if (!url.startsWith('vless://')) return null;
    const withoutPrefix = url.slice('vless://'.length);
    const hashIndex = withoutPrefix.indexOf('#');
    const mainPart = hashIndex >= 0 ? withoutPrefix.slice(0, hashIndex) : withoutPrefix;

    const [uuidAtAddr, queryString] = mainPart.split('?');
    const [uuid, addrPort] = uuidAtAddr.split('@');
    const lastColon = addrPort.lastIndexOf(':');
    const address = addrPort.slice(0, lastColon);
    const port = parseInt(addrPort.slice(lastColon + 1));

    const params = new URLSearchParams(queryString || '');

    return {
      address,
      port,
      uuid,
      network: params.get('type') || 'ws',
      security: params.get('security') || 'none',
      path: params.get('path') || '/',
      host: params.get('host') || '',
      flow: params.get('flow') || '',
      sni: params.get('sni') || '',
      encryption: params.get('encryption') || 'none',
    };
  } catch {
    return null;
  }
}
