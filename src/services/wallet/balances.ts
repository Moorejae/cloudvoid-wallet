/**
 * balances.ts — Fetch real balances from the backend through the riverbed
 * envelope. Only PUBLIC addresses are sent; keys never leave the device.
 */

import { envelopeRequest } from '../api/riverbedClient';
import { loadAddresses } from './storage';

export interface ChainBalance {
  address: string | null;
  balance: number;
  usd: number;
  price: number;
  change24h: number;
  status: string;
  detail?: string;
}

export async function fetchWalletBalances(): Promise<Record<string, ChainBalance> | null> {
  const addresses = await loadAddresses();
  if (!addresses || Object.keys(addresses).length === 0) return null;
  const res = await envelopeRequest<any>('/api/wallet/balances', { addresses });
  if (!res.success) throw new Error(res.error || 'Failed to fetch balances');
  return res.balances as Record<string, ChainBalance>;
}
