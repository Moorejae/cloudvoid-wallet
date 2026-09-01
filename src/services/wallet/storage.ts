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
const WEB_WALLET_LIST_KEY = 'cloudvoid_wallets_list';
const SECURE_MNEMONIC = 'cloudvoid_mnemonic';
const SECURE_ADDRESSES = 'cloudvoid_addresses';
const SECURE_WALLET_LIST = 'cloudvoid_wallets_list';

const isWeb = Platform.OS === 'web';

function ls(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return null;
}

export interface WalletListEntry {
  id: string;
  name: string;
  address: string;
  status: string;
}

export interface ExtraWalletRecord {
  id: string;
  name: string;
  mnemonic: string;
  addresses: Record<string, string>;
  primaryEth: string;
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

// ───────────────────── multiple wallets (extra accounts) ─────────────────────
// The primary wallet keeps its single-key storage above. Additional wallets
// ("Add New Wallet") get their own seed record so creating/importing a new
// wallet never overwrites the primary. On web each extra seed is encrypted with
// the same vault password the user already set; on native it lives in SecureStore.

function extraKey(id: string): string {
  return `cloudvoid_extra_wallet_${id}`;
}

export async function saveWalletList(list: WalletListEntry[]): Promise<void> {
  const json = JSON.stringify(list);
  if (isWeb) ls()?.setItem(WEB_WALLET_LIST_KEY, json);
  else await SecureStore.setItemAsync(SECURE_WALLET_LIST, json);
}

export function getPersistedWalletList(): WalletListEntry[] | null {
  if (!isWeb) return null;
  const raw = ls()?.getItem(WEB_WALLET_LIST_KEY);
  return raw ? (JSON.parse(raw) as WalletListEntry[]) : null;
}

export async function loadWalletList(): Promise<WalletListEntry[] | null> {
  if (isWeb) return getPersistedWalletList();
  const raw = await SecureStore.getItemAsync(SECURE_WALLET_LIST);
  return raw ? (JSON.parse(raw) as WalletListEntry[]) : null;
}

export async function saveExtraWallet(record: ExtraWalletRecord, password?: string): Promise<void> {
  if (isWeb) {
    if (!password) throw new Error('A vault password is required on web');
    const payload = await encryptVault(JSON.stringify(record), password);
    ls()?.setItem(extraKey(record.id), serializeVault(payload));
  } else {
    await SecureStore.setItemAsync(extraKey(record.id), JSON.stringify(record));
  }
}

export async function loadExtraWallet(id: string, password?: string): Promise<ExtraWalletRecord | null> {
  if (isWeb) {
    const raw = ls()?.getItem(extraKey(id));
    if (!raw) return null;
    if (!password) throw new Error('Vault password required');
    return JSON.parse(await decryptVault(parseVault(raw), password));
  }
  const raw = await SecureStore.getItemAsync(extraKey(id));
  return raw ? (JSON.parse(raw) as ExtraWalletRecord) : null;
}

export async function deleteExtraWallet(id: string): Promise<void> {
  if (isWeb) ls()?.removeItem(extraKey(id));
  else await SecureStore.deleteItemAsync(extraKey(id));
}

export async function clearAllExtraWallets(): Promise<void> {
  if (isWeb) {
    const storage = ls();
    if (!storage) return;
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith('cloudvoid_extra_wallet_')) keys.push(k);
    }
    keys.forEach((k) => storage.removeItem(k));
  }
  // Native SecureStore has no enumeration API; extra records are removed
  // individually by deleteWallet.
}
