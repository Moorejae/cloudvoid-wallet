/**
 * vault.ts — Encrypted key vault (web).
 *
 * User password -> PBKDF2-SHA256 (310k iterations) -> AES-256-GCM.
 * This is what makes the CloudFlare-hosted web wallet functional WITHOUT the
 * backend ever seeing keys: the vault blob (mnemonic + derived keys) is only
 * decryptable with the user's password, locally.
 *
 * Native (iOS/Android) continues to use expo-secure-store for key material.
 */

const ITERATIONS = 310000;
const te = new TextEncoder();
const td = new TextDecoder();

export interface VaultPayload {
  v: number;
  algo: 'PBKDF2-SHA256-AES256GCM';
  iterations: number;
  salt: string; // base64url, 16 bytes
  iv: string; // base64url, 12 bytes
  data: string; // base64url(ct || tag)
}

function b64url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const pwKey = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Encrypt a vault blob (e.g. mnemonic JSON) with a user password. */
export async function encryptVault(plaintext: string, password: string): Promise<VaultPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const combined = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(plaintext))
  );
  return {
    v: 1,
    algo: 'PBKDF2-SHA256-AES256GCM',
    iterations: ITERATIONS,
    salt: b64url(salt),
    iv: b64url(iv),
    data: b64url(combined),
  };
}

/** Decrypt a vault blob. Throws if the password is wrong (GCM auth fails). */
export async function decryptVault(payload: VaultPayload, password: string): Promise<string> {
  const salt = unb64url(payload.salt);
  const iv = unb64url(payload.iv);
  const combined = unb64url(payload.data);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined);
  return td.decode(plain);
}

export function serializeVault(payload: VaultPayload): string {
  return JSON.stringify(payload);
}

export function parseVault(json: string): VaultPayload {
  return JSON.parse(json);
}
