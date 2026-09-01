/**
 * chains.js — CloudVoid multi-chain registry (backend only).
 *
 * Each chain maps to an Alchemy network slug + the index of its API key inside
 * `ALCHEMY_API_KEYS` (comma-separated in .env). Mapping verified live on
 * 2026-08-13 by probing every network with `Authorization: Bearer <key>`.
 *
 * keyIndex: 0 = KEY1, 1 = KEY2, 2 = KEY3
 */

const CHAINS = [
  // id      name                 symbol   slug                     keyIndex  chainId      kind       decimals  explorer
  { id: 'eth',    name: 'Ethereum',        symbol: 'ETH',    slug: 'eth-mainnet',          keyIndex: 2, chainId: 1,     kind: 'evm',    decimals: 18, explorer: 'https://etherscan.io' },
  { id: 'poly',   name: 'Polygon',         symbol: 'POL',    slug: 'polygon-mainnet',      keyIndex: 1, chainId: 137,   kind: 'evm',    decimals: 18, explorer: 'https://polygonscan.com' },
  { id: 'bnb',    name: 'BNB Smart Chain', symbol: 'BNB',    slug: 'bnb-mainnet',          keyIndex: 0, chainId: 56,    kind: 'evm',    decimals: 18, explorer: 'https://bscscan.com' },
  { id: 'opbnb',  name: 'opBNB',           symbol: 'BNB',    slug: 'opbnb-mainnet',        keyIndex: 2, chainId: 204,   kind: 'evm',    decimals: 18, explorer: 'https://mainnet.opbnbscan.com' },
  { id: 'avax',   name: 'Avalanche',       symbol: 'AVAX',   slug: 'avax-mainnet',         keyIndex: 0, chainId: 43114, kind: 'evm',    decimals: 18, explorer: 'https://snowtrace.io' },
  { id: 'mnt',    name: 'Mantle',          symbol: 'MNT',    slug: 'mantle-mainnet',       keyIndex: 1, chainId: 5000, kind: 'evm',    decimals: 18, explorer: 'https://explorer.mantle.xyz' },
  { id: 'plasma', name: 'Plasma',          symbol: 'PLASMA', slug: 'plasma-mainnet',       keyIndex: 1, chainId: 9745, kind: 'evm',    decimals: 18, explorer: '' },
  { id: 'btc',    name: 'Bitcoin',         symbol: 'BTC',    slug: 'bitcoin-mainnet',      keyIndex: 2, chainId: null,  kind: 'utxo',   decimals: 8,  explorer: 'https://mempool.space' },
  { id: 'bch',    name: 'Bitcoin Cash',    symbol: 'BCH',    slug: 'bitcoincash-mainnet',  keyIndex: 0, chainId: null,  kind: 'utxo',   decimals: 8,  explorer: 'https://blockchair.com/bitcoin-cash' },
  { id: 'ltc',    name: 'Litecoin',        symbol: 'LTC',    slug: 'litecoin-mainnet',     keyIndex: 0, chainId: null,  kind: 'utxo',   decimals: 8,  explorer: 'https://blockchair.com/litecoin' },
  { id: 'doge',   name: 'Dogecoin',        symbol: 'DOGE',   slug: 'dogecoin-mainnet',     keyIndex: 1, chainId: null,  kind: 'utxo',   decimals: 8,  explorer: 'https://blockchair.com/dogecoin' },
  { id: 'sol',    name: 'Solana',          symbol: 'SOL',    slug: 'solana-mainnet',       keyIndex: 2, chainId: null,  kind: 'solana', decimals: 9,  explorer: 'https://solscan.io' },
  { id: 'trx',    name: 'Tron',            symbol: 'TRX',    slug: 'tron-mainnet',         keyIndex: 2, chainId: null,  kind: 'tron',   decimals: 6,  explorer: 'https://tronscan.org' },
  { id: 'apt',    name: 'Aptos',           symbol: 'APT',    slug: 'aptos-mainnet',        keyIndex: 0, chainId: 1,     kind: 'aptos',  decimals: 8,  explorer: 'https://explorer.aptoslabs.com' },
  { id: 'xlm',    name: 'Stellar',         symbol: 'XLM',    slug: 'stellar-mainnet',      keyIndex: 1, chainId: null,  kind: 'stellar', decimals: 7, explorer: 'https://stellar.expert' },
];

function byId(id) {
  return CHAINS.find((c) => c.id === id);
}

module.exports = { CHAINS, byId };
