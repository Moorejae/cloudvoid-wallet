/**
 * chains.ts — Frontend chain metadata mirror.
 *
 * Display + derivation metadata only. NO Alchemy slugs, NO API keys here —
 * RPC access lives in the backend (ai-backend/config/chains.js). The frontend
 * talks to the backend exclusively through the riverbed envelope.
 */

export type ChainKind = 'evm' | 'utxo' | 'solana' | 'tron' | 'aptos' | 'stellar';

export interface ChainMeta {
  id: string;
  name: string;
  symbol: string;
  kind: ChainKind;
  chainId: number | null;
  decimals: number;
  explorer: string;
}

export const CHAIN_META: ChainMeta[] = [
  { id: 'eth',    name: 'Ethereum',        symbol: 'ETH',    kind: 'evm',     chainId: 1,     decimals: 18, explorer: 'https://etherscan.io' },
  { id: 'poly',   name: 'Polygon',         symbol: 'POL',    kind: 'evm',     chainId: 137,   decimals: 18, explorer: 'https://polygonscan.com' },
  { id: 'bnb',    name: 'BNB Smart Chain', symbol: 'BNB',    kind: 'evm',     chainId: 56,    decimals: 18, explorer: 'https://bscscan.com' },
  { id: 'opbnb',  name: 'opBNB',           symbol: 'BNB',    kind: 'evm',     chainId: 204,   decimals: 18, explorer: 'https://mainnet.opbnbscan.com' },
  { id: 'avax',   name: 'Avalanche',       symbol: 'AVAX',   kind: 'evm',     chainId: 43114, decimals: 18, explorer: 'https://snowtrace.io' },
  { id: 'mnt',    name: 'Mantle',          symbol: 'MNT',    kind: 'evm',     chainId: 5000,  decimals: 18, explorer: 'https://explorer.mantle.xyz' },
  { id: 'plasma', name: 'Plasma',          symbol: 'PLASMA', kind: 'evm',     chainId: 9745,  decimals: 18, explorer: '' },
  { id: 'btc',    name: 'Bitcoin',         symbol: 'BTC',    kind: 'utxo',    chainId: null,  decimals: 8,  explorer: 'https://mempool.space' },
  { id: 'bch',    name: 'Bitcoin Cash',    symbol: 'BCH',    kind: 'utxo',    chainId: null,  decimals: 8,  explorer: 'https://blockchair.com/bitcoin-cash' },
  { id: 'ltc',    name: 'Litecoin',        symbol: 'LTC',    kind: 'utxo',    chainId: null,  decimals: 8,  explorer: 'https://blockchair.com/litecoin' },
  { id: 'doge',   name: 'Dogecoin',        symbol: 'DOGE',   kind: 'utxo',    chainId: null,  decimals: 8,  explorer: 'https://blockchair.com/dogecoin' },
  { id: 'sol',    name: 'Solana',          symbol: 'SOL',    kind: 'solana',  chainId: null,  decimals: 9,  explorer: 'https://solscan.io' },
  { id: 'trx',    name: 'Tron',            symbol: 'TRX',    kind: 'tron',    chainId: null,  decimals: 6,  explorer: 'https://tronscan.org' },
  { id: 'apt',    name: 'Aptos',           symbol: 'APT',    kind: 'aptos',   chainId: 1,     decimals: 8,  explorer: 'https://explorer.aptoslabs.com' },
  { id: 'xlm',    name: 'Stellar',         symbol: 'XLM',    kind: 'stellar', chainId: null,  decimals: 7,  explorer: 'https://stellar.expert' },
];

export function chainById(id: string): ChainMeta | undefined {
  return CHAIN_META.find((c) => c.id === id);
}
