/**
 * riverbedApi.ts — Typed API surface that travels through the riverbed envelope.
 * This is the pattern all future backend calls should follow (Phase 1+).
 */

import { envelopeRequest } from './api/riverbedClient';

export interface ChainHealth {
  id: string;
  name: string;
  symbol: string;
  slug: string;
  keyIndex: number;
  status: string;
  detail?: string | null;
}

export interface RiverbedPingResult {
  pong: boolean;
  echo: unknown;
  serverTs: number;
}

export interface ChainHealthResult {
  success: boolean;
  keyCount: number;
  chains: ChainHealth[];
}

export async function riverbedPing(): Promise<RiverbedPingResult> {
  return envelopeRequest<RiverbedPingResult>('/api/riverbed/ping', {
    hello: 'cloudvoid-web',
    clientTs: Date.now(),
  });
}

export async function fetchChainHealth(): Promise<ChainHealthResult> {
  return envelopeRequest<ChainHealthResult>('/api/health/chains', {});
}
