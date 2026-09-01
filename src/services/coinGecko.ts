import axios from 'axios';

export interface CoinGeckoPriceEntry {
  symbol: string;
  name: string;
  price: number;
  change: number;
  iconUrl: string;
  sparklineData: number[];
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  TRX: 'tron',
  TON: 'the-open-network',
  XMR: 'monero',
  USDT: 'tether',
  USDC: 'usd-coin',
  MATIC: 'matic-network',
  CELO: 'celo',
  DOGE: 'dogecoin',
  PEPE: 'pepe',
  SHIB: 'shiba-inu',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
  FLOKI: 'floki',
  APT: 'aptos',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  ADA: 'cardano',
  LINK: 'chainlink',
  RUNE: 'thorchain',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  AAVE: 'aave',
  UNI: 'uniswap',
  SUI: 'sui',
};

const TOKEN_META: Record<string, { name: string; iconUrl: string }> = {
  BTC: { name: 'Bitcoin', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png' },
  ETH: { name: 'Ethereum', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  BNB: { name: 'BNB', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png' },
  SOL: { name: 'Solana', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png' },
  TRX: { name: 'TRON', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png' },
  TON: { name: 'Toncoin', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png' },
  XMR: { name: 'Monero', iconUrl: 'https://cryptologos.cc/logos/monero-xmr-logo.png' },
  USDT: { name: 'Tether', iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  USDC: { name: 'USD Coin', iconUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  MATIC: { name: 'Polygon', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png' },
  CELO: { name: 'Celo', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png' },
  DOGE: { name: 'Dogecoin', iconUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
  PEPE: { name: 'Pepe', iconUrl: 'https://cryptologos.cc/logos/pepe-pepe-logo.png' },
  SHIB: { name: 'Shiba Inu', iconUrl: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png' },
  WIF: { name: 'dogwifhat', iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  BONK: { name: 'Bonk', iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  FLOKI: { name: 'Floki Inu', iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  APT: { name: 'Aptos', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/info/logo.png' },
  AVAX: { name: 'Avalanche', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png' },
  DOT: { name: 'Polkadot', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polkadot/info/logo.png' },
  ADA: { name: 'Cardano', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png' },
  LINK: { name: 'Chainlink', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  RUNE: { name: 'THORChain', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  LTC: { name: 'Litecoin', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png' },
  BCH: { name: 'Bitcoin Cash', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoincash/info/logo.png' },
  AAVE: { name: 'Aave', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  UNI: { name: 'Uniswap', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  SUI: { name: 'Sui', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png' },
};

function sparklineAround(price: number): number[] {
  const base = Math.max(0, price);
  return [
    Math.max(0, base * 0.92),
    Math.max(0, base * 0.94),
    Math.max(0, base * 0.97),
    base,
    Math.max(0, base * 1.03),
    Math.max(0, base * 1.06),
    Math.max(0, base * 1.1),
  ];
}

/** Fetch live prices + 24h change for the built-in token list. */
export async function fetchCoinGeckoPrices(): Promise<CoinGeckoPriceEntry[]> {
  const ids = Object.values(COINGECKO_IDS).join(',');

  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids,
      vs_currencies: 'usd',
      include_24hr_change: true,
    },
    timeout: 15000,
  });

  const prices = response.data || {};

  return Object.entries(COINGECKO_IDS)
    .map(([symbol, id]) => {
      const market = prices[id];
      if (!market || typeof market.usd !== 'number') return null;

      const meta = TOKEN_META[symbol] || { name: symbol, iconUrl: '' };
      const price = Number(market.usd) || 0;
      const change = Number(market.usd_24h_change) || 0;

      return {
        symbol,
        name: meta.name,
        price,
        change,
        iconUrl: meta.iconUrl,
        sparklineData: sparklineAround(price),
      };
    })
    .filter((item): item is CoinGeckoPriceEntry => Boolean(item));
}

/** Resolve an arbitrary token symbol (e.g. "PEPE", "SUI", "RUNE") to live data. */
export async function fetchCoinGeckoToken(symbol: string): Promise<CoinGeckoPriceEntry | null> {
  const upper = (symbol || '').trim().toUpperCase();
  if (!upper) return null;

  // Fast path: exact id map.
  const knownId = COINGECKO_IDS[upper];
  if (knownId) {
    const data = await fetchCoinGeckoPrices();
    return data.find((t) => t.symbol === upper) || null;
  }

  // Fallback: search CoinGecko for the closest match by symbol.
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/search', {
      params: { query: upper },
      timeout: 10000,
    });
    const coins = (res.data?.coins || []) as any[];
    const match = coins.find((c) => (c.symbol || '').toUpperCase() === upper) || coins[0];
    if (!match) return null;

    const detail = await axios.get(`https://api.coingecko.com/api/v3/coins/${match.id}`, {
      params: { localization: false, tickers: false, community_data: false, developer_data: false },
      timeout: 10000,
    });
    const d = detail.data;
    const price = Number(d?.market_data?.current_price?.usd) || 0;
    return {
      symbol: upper,
      name: d?.name || upper,
      price,
      change: Number(d?.market_data?.price_change_percentage_24h) || 0,
      iconUrl: d?.image?.small || d?.image?.large || '',
      sparklineData: sparklineAround(price),
    };
  } catch {
    return null;
  }
}

