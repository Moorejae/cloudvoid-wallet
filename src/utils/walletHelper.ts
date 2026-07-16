import { deriveWalletsFromSeed } from '../services/wallet-engine';

/**
 * Dynamically derives the correct blockchain address for a given token symbol
 * based on the user's secure mnemonic seed phrase.
 */
export function getAddressForToken(mnemonic: string | null, symbol: string, fallbackAddress: string): string {
  if (!mnemonic) return fallbackAddress;
  try {
    const derived = deriveWalletsFromSeed(mnemonic);
    const sym = symbol.toUpperCase();
    if (sym === 'BTC') {
      const w = derived.find(x => x.network === 'Bitcoin');
      if (w) return w.address;
    } else if (sym === 'SOL') {
      const w = derived.find(x => x.network === 'Solana');
      if (w) return w.address;
    } else if (sym === 'TRX') {
      const w = derived.find(x => x.network === 'Tron');
      if (w) return w.address;
    } else if (sym === 'XMR') {
      const w = derived.find(x => x.network === 'Monero');
      if (w) return w.address;
    } else {
      // EVM (ETH, BNB, USDT, CELO, MATIC, etc.)
      const w = derived.find(x => x.network === 'EVM (Base/ETH/BSC)');
      if (w) return w.address;
    }
  } catch (e) {
    console.error('Failed to derive address for symbol:', symbol, e);
  }
  return fallbackAddress;
}
