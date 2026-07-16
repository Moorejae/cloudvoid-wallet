import axios from 'axios';

// ──────── Configuration ────────
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  ((typeof window !== 'undefined' && window.location.hostname.includes('cloudvoid.online'))
    ? 'https://api.cloudvoid.online'
    : 'http://localhost:3000');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ──────── Types ────────
export interface DApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  wcIdentifier: string;
  url: string;
  chains: string[];
}

export interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  icon: string;
  marketCap: number;
}

export interface NewListing extends TrendingToken {
  listedAt: string;
}

export interface TokenDetail extends TrendingToken {
  chain: string;
  description: string;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  inputAmount: number;
  estimatedOutput: number;
  exchangeRate: number;
  slippage: string;
  gasFee: string;
  priceImpact: string;
  expiresIn: number;
  route: string;
}

export interface SwapResult {
  transactionHash: string;
  status: string;
  fromToken: string;
  toToken: string;
  inputAmount: number;
  outputAmount: number;
  gasFee: string;
  timestamp: string;
  blockNumber: number;
}

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  valueUSD: number;
  change24h: number;
  icon: string;
}

export interface FiatBuyQuote {
  provider: string;
  fiatAmount: number;
  cryptoToken: string;
  cryptoAmount: number;
  fee: number;
  checkoutUrl: string;
}

export interface FiatBuyResult {
  status: string;
  provider: string;
  txHash: string;
  amountPurchased: number;
  token: string;
}

// ──────── API Functions ────────

// 1. GET /api/dapps
export async function fetchAllDApps(): Promise<DApp[]> {
  try {
    const res = await api.get('/api/dapps');
    return res.data.data;
  } catch (err) {
    console.warn('fetchAllDApps failed:', err);
    return [];
  }
}

// 2. GET /api/dapps/category/:categoryName
export async function fetchDAppsByCategory(category: string): Promise<DApp[]> {
  try {
    const res = await api.get(`/api/dapps/category/${encodeURIComponent(category)}`);
    return res.data.data;
  } catch (err) {
    console.warn('fetchDAppsByCategory failed:', err);
    return [];
  }
}

// 3. GET /api/dapps/:appId
export async function fetchDAppDetail(appId: string): Promise<DApp | null> {
  try {
    const res = await api.get(`/api/dapps/${appId}`);
    return res.data.data;
  } catch (err) {
    console.warn('fetchDAppDetail failed:', err);
    return null;
  }
}

// 4. GET /api/crypto/trending
export async function fetchTrendingTokens(): Promise<TrendingToken[]> {
  try {
    const res = await api.get('/api/crypto/trending');
    return res.data.data;
  } catch (err) {
    console.warn('fetchTrendingTokens failed:', err);
    return [];
  }
}

// 5. GET /api/crypto/new-listings
export async function fetchNewListings(): Promise<NewListing[]> {
  try {
    const res = await api.get('/api/crypto/new-listings');
    return res.data.data;
  } catch (err) {
    console.warn('fetchNewListings failed:', err);
    return [];
  }
}

// 6. GET /api/crypto/token/:tokenAddress
export async function fetchTokenDetail(address: string): Promise<TokenDetail | null> {
  try {
    const res = await api.get(`/api/crypto/token/${address}`);
    return res.data.data;
  } catch (err) {
    console.warn('fetchTokenDetail failed:', err);
    return null;
  }
}

// 7. POST /api/swap
export async function getSwapQuote(fromToken: string, toToken: string, amount: number, walletAddress: string): Promise<SwapQuote | null> {
  try {
    const res = await api.post('/api/swap', { fromToken, toToken, amount, walletAddress });
    return res.data.data;
  } catch (err) {
    console.warn('getSwapQuote failed:', err);
    return null;
  }
}

// 8. POST /api/swap/execute
export async function executeSwap(fromToken: string, toToken: string, amount: number, walletAddress: string, estimatedOutput: number): Promise<SwapResult | null> {
  try {
    const res = await api.post('/api/swap/execute', { fromToken, toToken, amount, walletAddress, estimatedOutput });
    return res.data.data;
  } catch (err) {
    console.warn('executeSwap failed:', err);
    return null;
  }
}

// 9. GET /api/wallet/balance
export async function fetchWalletBalance(userId: string): Promise<{ balances: Record<string, number>; totalValueUSD: number } | null> {
  try {
    const res = await api.get('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${userId}` }
    });
    return res.data.data;
  } catch (err) {
    console.warn('fetchWalletBalance failed:', err);
    return null;
  }
}

// 10. GET /api/wallet/assets
export async function fetchWalletAssets(userId: string): Promise<{ assets: WalletAsset[]; totalValueUSD: number } | null> {
  try {
    const res = await api.get('/api/wallet/assets', {
      headers: { Authorization: `Bearer ${userId}` }
    });
    return res.data.data;
  } catch (err) {
    console.warn('fetchWalletAssets failed:', err);
    return null;
  }
}

// 11. POST /api/fiat/buy-quote
export async function getFiatBuyQuote(fiatAmount: number, cryptoToken: string, provider: 'moonpay' | 'coinbase'): Promise<FiatBuyQuote | null> {
  try {
    const res = await api.post('/api/fiat/buy-quote', { fiatAmount, cryptoToken, provider });
    return res.data.data;
  } catch (err) {
    console.warn('getFiatBuyQuote failed:', err);
    return null;
  }
}

// 12. POST /api/fiat/buy-execute
export async function executeFiatBuy(provider: string, fiatAmount: number, cryptoToken: string, cryptoAmount: number): Promise<FiatBuyResult | null> {
  try {
    const res = await api.post('/api/fiat/buy-execute', { provider, fiatAmount, cryptoToken, cryptoAmount });
    return res.data.data;
  } catch (err) {
    console.warn('executeFiatBuy failed:', err);
    return null;
  }
}

// 13. GET /api/fiat/affiliate-links
export async function fetchAffiliateLinks(address?: string, symbol?: string): Promise<Record<string, string> | null> {
  try {
    const res = await api.get('/api/fiat/affiliate-links', {
      params: { address, symbol }
    });
    return res.data.data;
  } catch (err) {
    console.warn('fetchAffiliateLinks failed:', err);
    return null;
  }
}
