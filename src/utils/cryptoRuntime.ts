import { generateBurnerAddress as realBurnerAddress } from '../services/wallet/derive';

export interface CryptoTokenSeed {
  symbol: string;
  name: string;
  price: number;
  change: number;
  iconUrl: string;
  sparklineData: number[];
}

export const FALLBACK_TOKENS: CryptoTokenSeed[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64210.50, change: 1.25, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [48, 52, 51, 56, 60, 63, 68] },
  { symbol: 'ETH', name: 'Ethereum', price: 3485.20, change: -0.52, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [58, 61, 60, 66, 69, 71, 74] },
  { symbol: 'SOL', name: 'Solana', price: 145.80, change: 4.12, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png', sparklineData: [38, 42, 45, 44, 47, 52, 58] },
  { symbol: 'XMR', name: 'Monero', price: 167.00, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [32, 36, 39, 42, 40, 44, 48] },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.02, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 50, 50, 50, 50, 51, 51] },
];

export function getLiveTokenFallback(): CryptoTokenSeed[] {
  return FALLBACK_TOKENS.map((token) => ({ ...token }));
}

/**
 * Generate a REAL, valid one-time address for the given network. Delegates to
 * the pure-JS derivation module so BTC/SOL/TRX/XLM/EVM addresses are all
 * structurally correct (no more mangled 0x -> bc1q/So111/T strings).
 */
export function generateBurnerAddress(symbol: string): string {
  return realBurnerAddress(symbol);
}

export function getSafeSwapQuote(fromToken: string, toToken: string, amount: number, tokenMap: Record<string, { price: number }>) {
  const fromPrice = tokenMap[fromToken]?.price || 1;
  const toPrice = tokenMap[toToken]?.price || 1;
  const exchangeRate = fromPrice / toPrice;
  const estimatedOutput = amount * exchangeRate;
  return {
    fromToken,
    toToken,
    inputAmount: amount,
    estimatedOutput,
    exchangeRate,
    slippage: '0.5%',
    gasFee: '~$1.50',
    priceImpact: '0.09%',
    expiresIn: 120,
    route: 'CloudVoid local router',
  };
}
