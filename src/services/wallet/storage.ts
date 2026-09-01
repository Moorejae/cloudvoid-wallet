/**
 * storage.ts — Key/address persistence, NON-CUSTODIAL.
 *
 * - Native (iOS/Android): mnemonic + public addresses in SecureStore (OS-level).
 * - Web (Cloudflare): mnemonic encrypted with the user's vault password
 *   (PBKDF2 + AES-256-GCM) into localStorage; PUBLIC addresses stored plainly
 *   (they are not secrets — the backend already sees them for balance lookups).
 *
 * The backend NEVER sees the mnemonic/private keys.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { encryptVault, decryptVault, serializeVault, parseVault } from '../crypto/vault';

const WEB_VAULT_KEY = 'cloudvoid_vault';
const WEB_ADDRESSES_KEY = 'cloudvoid_addresses';
const WEB_USER_ID_KEY = 'cloudvoid_userId';
const SECURE_MNEMONIC = 'cloudvoid_mnemonic';
const SECURE_ADDRESSES = 'cloudvoid_addresses';

const isWeb = Platform.OS === 'web';

function ls(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return null;
}

// ───────────────────── mnemonic (encrypted on web) ─────────────────────

export async function saveMnemonic(mnemonic: string, password?: string): Promise<void> {
  if (isWeb) {
    if (!password) throw new Error('A vault password is required on web');
    const payload = await encryptVault(mnemonic, password);
    ls()?.setItem(WEB_VAULT_KEY, serializeVault(payload));
  } else {
    await SecureStore.setItemAsync(SECURE_MNEMONIC, mnemonic);
  }
}

export async function loadMnemonic(password?: string): Promise<string | null> {
  if (isWeb) {
    const raw = ls()?.getItem(WEB_VAULT_KEY);
    if (!raw) return null;
    if (!password) throw new Error('Vault password required');
    return decryptVault(parseVault(raw), password);
  }
  return SecureStore.getItemAsync(SECURE_MNEMONIC);
}

export async function hasStoredMnemonic(): Promise<boolean> {
  if (isWeb) return !!ls()?.getItem(WEB_VAULT_KEY);
  return !!(await SecureStore.getItemAsync(SECURE_MNEMONIC));
}

export async function deleteMnemonic(): Promise<void> {
  if (isWeb) ls()?.removeItem(WEB_VAULT_KEY);
  else await SecureStore.deleteItemAsync(SECURE_MNEMONIC);
}

// ───────────────────── public addresses ─────────────────────

export async function saveAddresses(addresses: Record<string, string>): Promise<void> {
  const json = JSON.stringify(addresses);
  if (isWeb) ls()?.setItem(WEB_ADDRESSES_KEY, json);
  else await SecureStore.setItemAsync(SECURE_ADDRESSES, json);
}

export async function loadAddresses(): Promise<Record<string, string> | null> {
  if (isWeb) {
    const raw = ls()?.getItem(WEB_ADDRESSES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  }
  const raw = await SecureStore.getItemAsync(SECURE_ADDRESSES);
  return raw ? (JSON.parse(raw) as Record<string, string>) : null;
}

export async function savePrimaryAddress(address: string): Promise<void> {
  if (isWeb) ls()?.setItem(WEB_USER_ID_KEY, address);
}

// Sync accessors used by the store's initial state (web).
export function getPersistedPrimaryAddress(): string | null {
  if (!isWeb) return null;
  return ls()?.getItem(WEB_USER_ID_KEY) || null;
}

export function getPersistedAddresses(): Record<string, string> | null {
  if (!isWeb) return null;
  const raw = ls()?.getItem(WEB_ADDRESSES_KEY);
  return raw ? (JSON.parse(raw) as Record<string, string>) : null;
}
