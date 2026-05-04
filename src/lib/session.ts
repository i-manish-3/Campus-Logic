const SECRET = process.env.SESSION_SECRET || 'campus-logic-secret-key-change-in-production';

export type SessionPayload = {
  userId: string;
  tenantId: string;
  tenantDomain?: string;
  email: string;
  name: string;
  isSuperAdmin?: boolean;
};

// --- Web Crypto Utility Functions (Edge Runtime Compatible) ---

function ab2hex(buffer: ArrayBuffer) {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hex2ab(hex: string) {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a session payload into a cookie value.
 * Format: base64(json) . hmac_hex
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const data = utf8ToBase64(jsonStr);
  
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigHex = ab2hex(signature);
  
  return `${data}.${sigHex}`;
}

/**
 * Verifies and parses a session cookie value.
 * Returns null if invalid or tampered.
 */
export async function verifySession(cookie: string): Promise<SessionPayload | null> {
  try {
    const [data, sigHex] = cookie.split('.');
    if (!data || !sigHex) return null;

    const key = await getCryptoKey();
    const sigBytes = hex2ab(sigHex);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );

    if (!isValid) return null;

    const jsonStr = base64ToUtf8(data);
    return JSON.parse(jsonStr) as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'cl_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
