require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// ──────── Load Mock Data ────────
const dappsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dapps.json'), 'utf8'));
const cryptoData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'crypto.json'), 'utf8'));

const { extractIntentAndEntities, extractAsset, extractNetwork } = require('./parser/intentEngine');
const { getSession, updateSession, clearSession } = require('./stateManager');
const { AUTHORIZED_NETWORKS, deriveAllAddresses, fetchRealBalances, generateWalletAddress } = require('./services/cryptoService');
const responseGenerator = require('./parser/responseGenerator');
const { CHAINS: CHAIN_LIST } = require('./config/chains');
const { ping: pingChain, keyCount, rpc } = require('./services/alchemyClient');
const riverbed = require('./services/riverbed');
const { getBalances } = require('./services/balanceService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Store derived multi-chain addresses for sessions
const walletStore = new Map();

const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.userId = authHeader.split(' ')[1];
  }
  next();
};

// ──────── Admin Revenue Ledger (CloudVoid-O2 admin dashboard) ────────
// Every platform revenue stream (swap convenience fee, burner receiving fee,
// dapp referral fee, ...) is recorded here so the admin dashboard can display
// all incomes and let the admin withdraw from treasury.
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8000';

async function recordRevenue({
  source_type,
  amount_raw = 0,
  amount_usd = 0,
  token_symbol = 'USDT',
  fee_percent = null,
}) {
  try {
    await axios.post(`${ADMIN_API_URL}/api/admin/revenue/record`, {
      source_type,
      amount_raw,
      amount_usd,
      token_symbol,
      fee_percent,
    });
  } catch (err) {
    console.error(`[Revenue] Failed to record ${source_type}:`, err.message);
  }
}

// ──────── Helpers ────────
async function fetchCoinGeckoData(symbol) {
  const symbolMap = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'USDT': 'tether', 'BNB': 'binancecoin',
    'SOL': 'solana', 'XMR': 'monero', 'DOGE': 'dogecoin', 'ADA': 'cardano',
    'SHIB': 'shiba-inu', 'AVAX': 'avalanche-2', 'DOT': 'polkadot',
    'MATIC': 'matic-network', 'LINK': 'chainlink', 'TRX': 'tron', 'TRON': 'tron',
    'APT': 'aptos', 'APTOS': 'aptos', 'RUNE': 'thorchain', 'CELO': 'celo',
  };

  const id = symbolMap[symbol.toUpperCase()];
  if (!id) return null;

  try {
    const resp = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
      params: { localization: false, tickers: false, community_data: false, developer_data: false },
      timeout: 5000
    });
    const d = resp.data;
    return {
      name: d.name, 
      symbol: d.symbol?.toUpperCase(), 
      price: d.market_data?.current_price?.usd,
      change24h: d.market_data?.price_change_percentage_24h, 
      marketCap: d.market_data?.market_cap?.usd,
      contractAddress: d.platforms ? Object.values(d.platforms)[0] : null
    };
  } catch (err) {
    return null;
  }
}

// Capitalize helper
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ──────── Main Endpoint ────────
app.post('/api/concierge', async (req, res) => {
  const { message, currentScreen, sessionToken, directAction, tone = 'casual' } = req.body;

  if (!message) {
    return res.json({ speechResponse: "I didn't receive a message.", action: null, payload: null });
  }

  const sessionId = sessionToken || 'default_user_session';
  const session = getSession(sessionId);
  const cleanMsg = message.toLowerCase().trim();

  // ──── GLOBAL CANCEL ────
  if (session.currentFlow) {
    if (cleanMsg === 'cancel' || cleanMsg === 'abort' || cleanMsg === 'stop' || cleanMsg === 'nevermind') {
      clearSession(sessionId);
      return res.json({ speechResponse: "Action canceled. How else can I help you?", action: null, payload: null });
    }
  }

  // ──── EXTRACT INTENT AND ENTITIES ────
  const { action: detectedAction, entities } = extractIntentAndEntities(message);

  // If the user tapped a direct action chip (if any exist) or we are starting fresh
  let currentAction = session.currentFlow ? session.currentFlow : detectedAction;

  // If starting fresh but the detected action is UNKNOWN
  if (!session.currentFlow && currentAction === 'UNKNOWN') {
    return res.json({ speechResponse: "I'm not quite sure what you mean. You can ask me to add tokens, change the language, toggle the theme, or check market analytics.", action: null, payload: null });
  }

  // Set the flow if starting fresh
  if (!session.currentFlow) {
    updateSession(sessionId, { currentFlow: currentAction, step: 'INIT' });
  }

  // Reload session to ensure we have the latest state
  const activeSession = getSession(sessionId);

  // ══════════════════════════════════════════
  //  STATE MACHINE
  // ══════════════════════════════════════════

  // ── 1. CHANGE LANGUAGE ──
  if (activeSession.currentFlow === 'CHANGE_LANGUAGE') {
    const lang = entities.language || extractLanguageLocal(message);
    if (lang) {
      clearSession(sessionId);
      // Removed NAVIGATE, now sending direct global action
      return res.json({ speechResponse: responseGenerator.generateResponse('CHANGE_LANGUAGE', tone, { language: capitalize(lang) }), action: 'CHANGE_LANGUAGE', payload: { language: lang } });
    }
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_LANGUAGE' });
      return res.json({ speechResponse: "What language do you want?", action: null, payload: null });
    }
  }

  // ── 2. CHANGE CURRENCY ──
  if (activeSession.currentFlow === 'CHANGE_CURRENCY') {
    const currency = entities.currency || extractCurrencyLocal(message);
    if (currency) {
      clearSession(sessionId);
      // Removed NAVIGATE, now sending direct global action
      return res.json({ speechResponse: responseGenerator.generateResponse('CHANGE_CURRENCY', tone, { currency: currency.toUpperCase() }), action: 'CHANGE_CURRENCY', payload: { currency: currency.toUpperCase() } });
    }
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_CURRENCY' });
      return res.json({ speechResponse: "Which fiat currency do you want as your default?", action: null, payload: null });
    }
  }

  // ── 3. ADD TOKEN ──
  if (activeSession.currentFlow === 'ADD_TOKEN') {
    let asset = entities.asset;
    if (!asset && activeSession.step === 'AWAITING_TOKEN_NAME') {
      asset = extractAsset(message) || message.trim().toUpperCase().split(' ')[0];
    }
    if (!asset && activeSession.tempAsset) {
      asset = activeSession.tempAsset;
    }

    let networkRaw = entities.network;
    if (!networkRaw && activeSession.step === 'AWAITING_NETWORK') {
      networkRaw = extractNetwork(message) || message.trim().toLowerCase();
    }

    if (!asset) {
      updateSession(sessionId, { step: 'AWAITING_TOKEN_NAME' });
      return res.json({ speechResponse: "What is the name of the token you want to add?", action: null, payload: null });
    }

    // Asset is known. Ask for network if not provided.
    if (!networkRaw) {
      updateSession(sessionId, { tempAsset: asset, step: 'AWAITING_NETWORK' });
      return res.json({ speechResponse: `Which blockchain network should ${asset.toUpperCase()} be on? (e.g. ERC-20, BEP-20, or TRC-20)`, action: null, payload: null });
    }

    const networkId = AUTHORIZED_NETWORKS[networkRaw] || 'ethereum';
    const data = await fetchCoinGeckoData(asset);
    if (!data) {
      clearSession(sessionId);
      return res.json({ speechResponse: `I couldn't find a contract for "${asset}" on CoinGecko. Please verify the name and try again.`, action: null, payload: null });
    }

    const { address } = generateWalletAddress(networkId);
    clearSession(sessionId);
    return res.json({
      speechResponse: responseGenerator.generateResponse('ADD_TOKEN', tone, { asset: data.symbol, network: networkRaw.toUpperCase(), address }),
      action: 'ADD_TOKEN',
      payload: { symbol: data.symbol, name: data.name, network: networkId, address }
    });
  }

  // ── 4. REMOVE TOKEN ──
  if (activeSession.currentFlow === 'REMOVE_TOKEN') {
    const asset = entities.asset || extractAsset(message);
    if (asset) {
      clearSession(sessionId);
      return res.json({
        speechResponse: responseGenerator.generateResponse('REMOVE_TOKEN', tone, { asset }),
        action: 'REMOVE_TOKEN', payload: { symbol: asset }
      });
    }
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_ASSET_TO_REMOVE' });
      return res.json({ speechResponse: "Which token from your dashboard do you want to remove?", action: null, payload: null });
    }
  }

  // ── 5. TOGGLE THEME ──
  if (activeSession.currentFlow === 'TOGGLE_THEME') {
    clearSession(sessionId);
    return res.json({ speechResponse: responseGenerator.generateResponse('TOGGLE_THEME', tone), action: 'TOGGLE_THEME', payload: null });
  }

  // ── 6. TOKEN INFO ──
  if (activeSession.currentFlow === 'TOKEN_INFO') {
    const asset = entities.asset || extractAsset(message);
    if (asset) {
      const data = await fetchCoinGeckoData(asset);
      clearSession(sessionId);
      if (!data) {
        return res.json({ speechResponse: `Could not fetch details for "${asset}". Verify the symbol and try again.`, action: null, payload: null });
      }
      const summary = responseGenerator.generateResponse('TOKEN_INFO', tone, {
        asset: data.symbol,
        price: data.price?.toLocaleString() ?? 'N/A',
        change: data.change24h?.toFixed(2) ?? 'N/A',
        marketCap: data.marketCap?.toLocaleString() ?? 'N/A',
        risk: '0'
      });
      return res.json({ 
        speechResponse: summary, 
        action: 'SHOW_SCAM_WARNING', 
        payload: { symbol: data.symbol } 
      });
    }
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_TOKEN_QUERY' });
      return res.json({ speechResponse: "Which token do you want information on?", action: null, payload: null });
    }
  }

  // ── 7. FILTER DEPOSITS ──
  if (activeSession.currentFlow === 'FILTER_DEPOSITS') {
    clearSession(sessionId);
    return res.json({ speechResponse: responseGenerator.generateResponse('FILTER_DEPOSITS', tone), action: 'FILTER_LIST', payload: { filters: 'deposits' } });
  }

  // ── 8. FILTER WITHDRAWALS ──
  if (activeSession.currentFlow === 'FILTER_WITHDRAWALS') {
    clearSession(sessionId);
    return res.json({ speechResponse: responseGenerator.generateResponse('FILTER_WITHDRAWALS', tone), action: 'FILTER_LIST', payload: { filters: 'withdrawals' } });
  }

  // ── 9. SEARCH HASH ──
  if (activeSession.currentFlow === 'SEARCH_HASH') {
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_HASH' });
      return res.json({ speechResponse: "Paste the transaction hash or ID you want to look up.", action: null, payload: null });
    }
    if (activeSession.step === 'AWAITING_HASH') {
      const hash = message.trim();
      clearSession(sessionId);
      return res.json({
        speechResponse: responseGenerator.generateResponse('SEARCH_HASH', tone, { hash: hash.substring(0, 16) }),
        action: 'SEARCH_HASH', payload: { hash }
      });
    }
  }

  // ── 10. GENERATE BURNER ──
  if (activeSession.currentFlow === 'GENERATE_BURNER') {
    let networkRaw = entities.network;
    if (!networkRaw && activeSession.step === 'AWAITING_NETWORK') {
      networkRaw = extractNetwork(message) || message.trim().toLowerCase();
    }

    if (!networkRaw) {
      updateSession(sessionId, { step: 'AWAITING_NETWORK' });
      return res.json({ speechResponse: "Which blockchain network should the burner wallet be on? (e.g. ERC-20, BEP-20, or TRC-20)", action: null, payload: null });
    }

    const networkId = AUTHORIZED_NETWORKS[networkRaw] || 'ethereum';
    const { address, privateKey } = generateWalletAddress(networkId);
    
    const symbolMap = {
      'bitcoin': 'BTC', 'btc': 'BTC',
      'ethereum': 'ETH', 'eth': 'ETH', 'erc20': 'ETH', 'erc-20': 'ETH',
      'solana': 'SOL', 'sol': 'SOL',
      'tron': 'TRX', 'trx': 'TRX', 'trc20': 'TRX', 'trc-20': 'TRX',
      'bsc': 'BNB', 'bnb': 'BNB', 'bep20': 'BNB', 'bep-20': 'BNB'
    };
    const symbol = symbolMap[networkRaw.toLowerCase()] || 'ETH';

    clearSession(sessionId);

    // A burner address carries a 10% platform receiving fee (one-time address
    // revenue stream shown on the admin dashboard). The fee is collected when
    // funds are swept out of the burner (see /api/wallet/burner/sweep).
    return res.json({ 
      speechResponse: responseGenerator.generateResponse('GENERATE_BURNER', tone, { address }), 
      action: 'GENERATE_BURNER', 
      payload: { address, privateKey, symbol, receivingFeePercent: 10 } 
    });
  }

  // ── 13. SWAP / TRADE / WEB3 ──
  if (activeSession.currentFlow === 'SWAP' || activeSession.currentFlow === 'OPEN_WEB3') {
    clearSession(sessionId);
    const route = activeSession.currentFlow === 'SWAP' ? 'CryptoTrading' : 'Web3';
    return res.json({
      speechResponse: route === 'CryptoTrading'
        ? "Opening crypto & meme-coin trading. You can swap any asset instantly there — a 1% convenience fee applies."
        : "Opening the Web3 portal. Explore dApps, DeFi and meme-coin trading there.",
      action: 'NAVIGATE',
      payload: { route }
    });
  }

  // ── 11. SCAN RECEIPT ──
  if (activeSession.currentFlow === 'SCAN_RECEIPT') {
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_RECEIPT' });
      return res.json({ speechResponse: "Please paste the receipt string or hash to scan.", action: null, payload: null });
    }
    if (activeSession.step === 'AWAITING_RECEIPT') {
      const receipt = message.trim();
      clearSession(sessionId);
      return res.json({ 
        speechResponse: responseGenerator.generateResponse('SCAN_RECEIPT', tone, { receipt: receipt.substring(0, 10) }), 
        action: 'SCAN_RECEIPT', 
        payload: { receipt } 
      });
    }
  }

  // ── 12. FILTER BY DATE ──
  if (activeSession.currentFlow === 'FILTER_BY_DATE') {
    if (activeSession.step === 'INIT') {
      updateSession(sessionId, { step: 'AWAITING_DATE' });
      return res.json({ speechResponse: "What date or range? (e.g. 'today', 'June 2025')", action: null, payload: null });
    }
    if (activeSession.step === 'AWAITING_DATE') {
      const dateParam = message.trim();
      clearSession(sessionId);
      return res.json({ 
        speechResponse: responseGenerator.generateResponse('FILTER_BY_DATE', tone, { dateParam }), 
        action: 'FILTER_LIST', 
        payload: { filters: 'date', value: dateParam } 
      });
    }
  }

  // ── 13. PING LATENCY ──
  if (activeSession.currentFlow === 'PING_LATENCY') {
    clearSession(sessionId);
    const startTime = Date.now();
    try {
      await axios.get('https://api.coingecko.com/api/v3/ping', { timeout: 5000 });
      const latency = Date.now() - startTime;
      return res.json({ speechResponse: `Network latency test complete. Round-trip: ${latency}ms. Do you want anything else?`, action: null, payload: null });
    } catch {
      return res.json({ speechResponse: "Ping test failed. The external endpoint did not respond.", action: null, payload: null });
    }
  }

  // ── 14. CHECK SCAM (Absorbed into TOKEN_INFO) ──

  // ── 15. TOGGLE NOTIFICATIONS ──
  if (activeSession.currentFlow === 'TOGGLE_NOTIFICATIONS') {
    clearSession(sessionId);
    return res.json({ speechResponse: responseGenerator.generateResponse('TOGGLE_NOTIFICATIONS', tone), action: 'TOGGLE_NOTIFICATIONS', payload: null });
  }

  // ── 16. GREETING / CAPABILITIES ──
  if (activeSession.currentFlow === 'GREETING' || activeSession.currentFlow === 'CAPABILITY_CHECK') {
    clearSession(sessionId);
    return res.json({ speechResponse: responseGenerator.generateResponse('GREETING', tone), action: null, payload: null });
  }

  // ── GUARD: Fallback if mid-flow but nothing matched ──
  if (activeSession.currentFlow) {
    return res.json({ speechResponse: "I need a bit more info for that task. Or type 'cancel' to stop.", action: null, payload: null });
  }

  return res.json({ speechResponse: responseGenerator.generateResponse('UNKNOWN', tone), action: null, payload: null });
});

// Local helper fallbacks if entities miss it
function extractLanguageLocal(text) {
  const match = text.match(/(mandarin|chinese|english|spanish|french|german|japanese|korean|igbo|yoruba|hausa|hindi|arabic|portuguese|russian)/i);
  return match ? match[1] : null;
}
function extractCurrencyLocal(text) {
  const match = text.match(/(usd|eur|gbp|jpy|aud|cad|chf|cny|inr|ngn|zar)/i);
  return match ? match[1].toUpperCase() : null;
}

// ──────── Prices Cache & Background Poller (100% Free Hybrid API) ────────
let priceCache = {
  'DOGE': { usd: 0.1542, usd_24h_change: 5.23 },
  'PEPE': { usd: 0.00000852, usd_24h_change: -2.14 },
  'WIF': { usd: 2.54, usd_24h_change: 12.45 },
  'BONK': { usd: 0.00002135, usd_24h_change: -1.32 },
  'SHIB': { usd: 0.00001785, usd_24h_change: 0.45 },
  'FLOKI': { usd: 0.0001625, usd_24h_change: 8.76 },
  'BTC': { usd: 64210.50, usd_24h_change: 1.25 },
  'ETH': { usd: 3485.20, usd_24h_change: -0.52 },
  'APT': { usd: 8.42, usd_24h_change: 2.41 },
  'SOL': { usd: 145.80, usd_24h_change: 4.12 },
  'BNB': { usd: 575.30, usd_24h_change: 0.85 },
  'AVAX': { usd: 28.15, usd_24h_change: -1.15 }
};

async function refreshPriceCache() {
  console.log("[Prices Poller] Refreshing price cache...");
  
  // 1. Fetch major coins from Binance (completely free, unlimited, no key)
  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "DOGEUSDT", "SHIBUSDT", "AVAXUSDT", "XMRUSDT", "TRXUSDT", "LTCUSDT", "APTUSDT"];
    const binancePromises = symbols.map(s => 
      axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`, { timeout: 4000 })
    );
    const results = await Promise.allSettled(binancePromises);
    
    const keyMap = {
      "BTCUSDT": "BTC",
      "ETHUSDT": "ETH",
      "BNBUSDT": "BNB",
      "SOLUSDT": "SOL",
      "DOGEUSDT": "DOGE",
      "SHIBUSDT": "SHIB",
      "AVAXUSDT": "AVAX",
      "XMRUSDT": "XMR",
      "TRXUSDT": "TRX",
      "LTCUSDT": "LTC",
      "APTUSDT": "APT"
    };

    results.forEach((res, i) => {
      if (res.status === "fulfilled") {
        const d = res.value.data;
        const key = keyMap[symbols[i]];
        if (key) {
          priceCache[key] = {
            usd: parseFloat(d.lastPrice),
            usd_24h_change: parseFloat(d.priceChangePercent)
          };
        }
      }
    });
    console.log("[Prices Poller] Binance fetch completed successfully.");
  } catch (err) {
    console.error("[Prices Poller] Binance fetch error:", err.message);
  }

  // 2. Fetch minor/memecoins from CoinGecko Free Tier (Cached to avoid rate limits)
  try {
    const ids = 'pepe,wif,bonk,floki,celo,matic-network,ton';
    const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: { ids, vs_currencies: 'usd', include_24hr_change: 'true' },
      timeout: 5000
    });
    
    const geckoData = resp.data;
    if (geckoData.pepe) priceCache['PEPE'] = { usd: geckoData.pepe.usd, usd_24h_change: geckoData.pepe.usd_24h_change };
    if (geckoData.wif) priceCache['WIF'] = { usd: geckoData.wif.usd, usd_24h_change: geckoData.wif.usd_24h_change };
    if (geckoData.bonk) priceCache['BONK'] = { usd: geckoData.bonk.usd, usd_24h_change: geckoData.bonk.usd_24h_change };
    if (geckoData.floki) priceCache['FLOKI'] = { usd: geckoData.floki.usd, usd_24h_change: geckoData.floki.usd_24h_change };
    if (geckoData.celo) priceCache['CELO'] = { usd: geckoData.celo.usd, usd_24h_change: geckoData.celo.usd_24h_change };
    if (geckoData['matic-network']) priceCache['MATIC'] = { usd: geckoData['matic-network'].usd, usd_24h_change: geckoData['matic-network'].usd_24h_change };
    if (geckoData.ton) priceCache['TON'] = { usd: geckoData.ton.usd, usd_24h_change: geckoData.ton.usd_24h_change };
    priceCache['USDT'] = { usd: 1.0, usd_24h_change: 0.0 };
    priceCache['USDC'] = { usd: 1.0, usd_24h_change: 0.0 };
    
    console.log("[Prices Poller] CoinGecko fetch completed successfully.");
  } catch (err) {
    console.error("[Prices Poller] CoinGecko fetch warning (using cache/fallback):", err.message);
  }
}

// Start polling every 5 minutes
refreshPriceCache();
setInterval(refreshPriceCache, 5 * 60 * 1000);

// ──────── Prices Endpoint ────────
app.get('/api/prices', async (req, res) => {
  return res.json(priceCache);
});

// ──────── Chain Health (Phase 0: prove every network is reachable) ────────
// Registered for both GET (plain curl) and POST (riverbed envelope) so the
// frontend can query it through the encrypted channel.
const healthChainsHandler = async (req, res) => {
  try {
    const chains = await Promise.all(
      CHAIN_LIST.map(async (c) => {
        const p = await pingChain(c);
        return { id: c.id, name: c.name, symbol: c.symbol, slug: c.slug, keyIndex: c.keyIndex, ...p };
      })
    );
    return res.json({ success: true, keyCount, chains });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
app.get('/api/health/chains', healthChainsHandler);
app.post('/api/health/chains', healthChainsHandler);

// ──────── Riverbed Envelope (Phase 0) ────────
// Server public key (safe to publish; the private key stays on the backend VPS).
app.get('/api/riverbed/pubkey', (req, res) => {
  res.json({ success: true, protocol: 'cloudvoid-riverbed-v1', publicKey: riverbed.serverPublicKeyRaw() });
});

// Envelope round-trip test: decrypt request envelope, respond with encrypted envelope.
app.post('/api/riverbed/ping', (req, res) => {
  try {
    const envelope = req.body;
    const plain = riverbed.decryptEnvelope(envelope);
    const response = riverbed.encryptForClient(envelope.clientPub, {
      pong: true,
      echo: plain,
      serverTs: Date.now(),
    });
    res.json(response);
  } catch (err) {
    res.status(400).json({ error: 'Envelope decryption failed', detail: err.message });
  }
});

// ──────── Non-Custodial Balances (Phase 1) ────────
// Client derives addresses LOCALLY, sends ONLY public addresses through the
// envelope; the backend looks up real balances (never sees keys/mnemonics).
app.post('/api/wallet/balances', (req, res) => {
  let plain;
  try {
    plain = riverbed.decryptEnvelope(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Envelope decryption failed', detail: err.message });
  }
  const addresses = (plain && plain.addresses) || {};
  (async () => {
    const balances = await getBalances(addresses, (symbol) => {
      const p = priceCache[symbol];
      return p ? { usd: p.usd, change24h: p.usd_24h_change } : {};
    });
    res.json(riverbed.encryptForClient(req.body.clientPub, { success: true, balances }));
  })().catch((err) => {
    res.json(riverbed.encryptForClient(req.body.clientPub, { success: false, error: err.message }));
  });
});

// ──────── Wallet Endpoints ────────
app.post('/api/wallet/register', async (req, res) => {
  const { address, mnemonic, importMethod } = req.body;
  
  if (!address && !mnemonic) {
    return res.status(400).json({ error: 'Wallet address or mnemonic required' });
  }

  try {
    let addresses = { eth: address };
    if (mnemonic) {
      addresses = await deriveAllAddresses(mnemonic);
    }

    // Save multi-chain addresses linked to the main EVM token ID
    const primaryId = addresses.eth || address;
    walletStore.set(primaryId, addresses);

    // Initial quick fetch of balances
    const balances = await fetchRealBalances(addresses);

    const defaultTokens = [
      { symbol: 'BTC', name: 'Bitcoin', price: 64210.50, balance: balances.BTC || 0, valueUSD: (balances.BTC || 0) * 64210.50, iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', change: 1.25 },
      { symbol: 'ETH', name: 'Ethereum', price: 3485.20, balance: balances.ETH || 0, valueUSD: (balances.ETH || 0) * 3485.20, iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', change: -0.52 },
      { symbol: 'BNB', name: 'BNB', price: 575.30, balance: balances.BNB || 0, valueUSD: (balances.BNB || 0) * 575.30, iconUrl: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', change: 0.85 },
      { symbol: 'SOL', name: 'Solana', price: 145.80, balance: balances.SOL || 0, valueUSD: (balances.SOL || 0) * 145.80, iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png', change: 4.12 },
      { symbol: 'TRX', name: 'Tron', price: 0.12, balance: balances.TRX || 0, valueUSD: (balances.TRX || 0) * 0.12, iconUrl: 'https://cryptologos.cc/logos/tron-trx-logo.png', change: 1.05 },
      { symbol: 'XMR', name: 'Monero', price: 167.00, balance: balances.XMR || 0, valueUSD: (balances.XMR || 0) * 167.00, iconUrl: 'https://cryptologos.cc/logos/monero-xmr-logo.png', change: 3.45 }
    ];

    return res.json({
      success: true,
      message: 'Wallet registered successfully',
      wallet: { address: primaryId, allAddresses: addresses, method: importMethod || 'create' },
      tokens: defaultTokens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register wallet chains' });
  }
});

// ── 9. GET /api/wallet/balance — Wallet token balances ──
app.get('/api/wallet/balance', checkAuth, async (req, res) => {
  const addresses = walletStore.get(req.userId) || { eth: req.userId };
  const balances = await fetchRealBalances(addresses);
  
  const totalValueUSD = 
    (balances.BTC || 0) * 64210.50 +
    (balances.ETH || 0) * 3485.20 +
    (balances.BNB || 0) * 575.30 +
    (balances.SOL || 0) * 145.80 +
    (balances.TRX || 0) * 0.12 +
    (balances.XMR || 0) * 167.00;

  return res.json({
    success: true,
    data: {
      balances,
      totalValueUSD
    }
  });
});

// ── 10. GET /api/wallet/assets — Full asset details ──
app.get('/api/wallet/assets', checkAuth, async (req, res) => {
  const addresses = walletStore.get(req.userId) || { eth: req.userId };
  const balances = await fetchRealBalances(addresses);
  
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: balances.BTC || 0, price: priceCache['BTC']?.usd || 64210.50, valueUSD: (balances.BTC || 0) * (priceCache['BTC']?.usd || 64210.50), change24h: priceCache['BTC']?.usd_24h_change || 1.25, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { symbol: 'ETH', name: 'Ethereum', balance: balances.ETH || 0, price: priceCache['ETH']?.usd || 3485.20, valueUSD: (balances.ETH || 0) * (priceCache['ETH']?.usd || 3485.20), change24h: priceCache['ETH']?.usd_24h_change || -0.52, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'BNB', name: 'BNB', balance: balances.BNB || 0, price: priceCache['BNB']?.usd || 575.30, valueUSD: (balances.BNB || 0) * (priceCache['BNB']?.usd || 575.30), change24h: priceCache['BNB']?.usd_24h_change || 0.85, icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
    { symbol: 'SOL', name: 'Solana', balance: balances.SOL || 0, price: priceCache['SOL']?.usd || 145.80, valueUSD: (balances.SOL || 0) * (priceCache['SOL']?.usd || 145.80), change24h: priceCache['SOL']?.usd_24h_change || 4.12, icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { symbol: 'TRX', name: 'Tron', balance: balances.TRX || 0, price: priceCache['TRX']?.usd || 0.12, valueUSD: (balances.TRX || 0) * (priceCache['TRX']?.usd || 0.12), change24h: priceCache['TRX']?.usd_24h_change || 1.05, icon: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
    { symbol: 'XMR', name: 'Monero', balance: balances.XMR || 0, price: priceCache['XMR']?.usd || 167.00, valueUSD: (balances.XMR || 0) * (priceCache['XMR']?.usd || 167.00), change24h: priceCache['XMR']?.usd_24h_change || 3.45, icon: 'https://cryptologos.cc/logos/monero-xmr-logo.png' }
  ];

  const totalValueUSD = assets.reduce((sum, a) => sum + a.valueUSD, 0);

  return res.json({
    success: true,
    data: {
      assets,
      totalValueUSD
    }
  });
});

// ── 11. POST /api/wallet/revenue/record — Generic revenue event ──
// Lets the frontend record a platform revenue event (e.g. burner receiving fee)
// straight into the admin dashboard ledger through the encrypted mobile API.
app.post('/api/wallet/revenue/record', (req, res) => {
  const { source_type, amount_raw, amount_usd, token_symbol, fee_percent } = req.body || {};
  if (!source_type || amount_raw == null) {
    return res.status(400).json({ success: false, error: 'source_type and amount_raw are required' });
  }
  recordRevenue({ source_type, amount_raw, amount_usd, token_symbol, fee_percent });
  return res.json({ success: true, message: `Revenue event '${source_type}' recorded.` });
});

// ── 12. POST /api/wallet/burner/sweep — Sweep a burner & collect the 10% receiving fee ──
// A burner address carries a 10% platform receiving fee. When funds are swept
// out, 10% of the swept amount is recorded to the admin ledger as
// `one_time_address` revenue (the rest returns to the user).
app.post('/api/wallet/burner/sweep', async (req, res) => {
  const { amount, amount_usd, token_symbol, destination } = req.body || {};
  const swept = parseFloat(amount) || 0;
  if (swept <= 0) {
    return res.status(400).json({ success: false, error: 'A positive amount to sweep is required' });
  }

  const feePct = 0.10; // 10% receiving fee on burner addresses
  const feeRaw = +(swept * feePct).toFixed(8);
  const feeUSD = amount_usd != null ? +((parseFloat(amount_usd) || swept) * feePct).toFixed(4) : +feeRaw.toFixed(4);

  await recordRevenue({
    source_type: 'one_time_address',
    amount_raw: feeRaw,
    amount_usd: feeUSD,
    token_symbol: token_symbol || 'USDT',
    fee_percent: 10.0,
  });

  return res.json({
    success: true,
    swept: swept,
    receiving_fee_pct: 10,
    fee_raw: feeRaw,
    fee_usd: feeUSD,
    net_to_destination: +(swept - feeRaw).toFixed(8),
    destination: destination || 'primary',
  });
});

// ══════════════════════════════════════════
//  WEB3 PORTAL API ENDPOINTS
// ══════════════════════════════════════════

// ── 1. GET /api/dapps — All dApps ──
app.get('/api/dapps', (req, res) => {
  return res.json({ success: true, data: dappsData });
});

// ── 2. GET /api/dapps/category/:categoryName — Filter by category ──
app.get('/api/dapps/category/:categoryName', (req, res) => {
  const { categoryName } = req.params;
  const filtered = dappsData.filter(
    d => d.category.toLowerCase() === categoryName.toLowerCase()
  );
  if (filtered.length === 0) {
    return res.status(404).json({ success: false, error: `No dApps found for category: ${categoryName}` });
  }
  return res.json({ success: true, category: categoryName, data: filtered });
});

// ── 3. GET /api/dapps/:appId — Single dApp detail ──
app.get('/api/dapps/:appId', (req, res) => {
  const { appId } = req.params;
  const dapp = dappsData.find(d => d.id === appId);
  if (!dapp) {
    return res.status(404).json({ success: false, error: `dApp not found: ${appId}` });
  }
  return res.json({ success: true, data: dapp });
});

// ── 4. GET /api/crypto/trending — Trending meme coins ──
app.get('/api/crypto/trending', (req, res) => {
  // Apply small random fluctuation to simulate live data
  const live = cryptoData.trending.map(t => ({
    ...t,
    price: +(t.price * (1 + (Math.random() - 0.5) * 0.01)).toPrecision(6),
    change24h: +(t.change24h + (Math.random() - 0.5) * 0.5).toFixed(2)
  }));
  return res.json({ success: true, data: live });
});

// ── 5. GET /api/crypto/new-listings — Newly listed tokens ──
app.get('/api/crypto/new-listings', (req, res) => {
  const live = cryptoData.newListings.map(t => ({
    ...t,
    price: +(t.price * (1 + (Math.random() - 0.5) * 0.02)).toPrecision(6),
    change24h: +(t.change24h + (Math.random() - 0.5) * 2).toFixed(2)
  }));
  return res.json({ success: true, data: live });
});

// ── 6. GET /api/crypto/token/:tokenAddress — Token detail ──
app.get('/api/crypto/token/:tokenAddress', (req, res) => {
  const { tokenAddress } = req.params;
  const token = cryptoData.tokenDetails[tokenAddress];
  if (!token) {
    return res.status(404).json({ success: false, error: `Token not found: ${tokenAddress}` });
  }
  return res.json({
    success: true,
    data: {
      ...token,
      price: +(token.price * (1 + (Math.random() - 0.5) * 0.005)).toPrecision(6),
      change24h: +(token.change24h + (Math.random() - 0.5) * 0.3).toFixed(2)
    }
  });
});

function estimateUSDValue(token, amount) {
  return parseFloat(amount) * getTokenPriceUSD(token);
}

function getTokenPriceUSD(symbol) {
  const key = String(symbol || '').toUpperCase();
  if (key === 'USDT' || key === 'USDC') return 1.0;
  const p = priceCache[key];
  return p && p.usd ? parseFloat(p.usd) : 1.0;
}

// Map a token pair to a real protocol so swaps are visibly powered by dApps.
function pickRouter(fromToken, toToken) {
  const keys = [String(fromToken || '').toUpperCase(), String(toToken || '').toUpperCase()];
  if (keys.includes('SOL')) return { dapp: 'Jupiter', chain: 'Solana' };
  if (keys.includes('DOGE') || keys.includes('BNB') || keys.includes('SHIB') || keys.includes('PEPE')) {
    return { dapp: 'PancakeSwap', chain: 'BNB Chain' };
  }
  if (keys.includes('TRX')) return { dapp: 'JustSwap', chain: 'TRON' };
  if (keys.includes('APT')) return { dapp: 'Liquidswap', chain: 'Aptos' };
  if (keys.includes('AVAX')) return { dapp: 'Trader Joe', chain: 'Avalanche' };
  if (keys.includes('MATIC') || keys.includes('POL')) return { dapp: 'QuickSwap', chain: 'Polygon' };
  return { dapp: 'Uniswap', chain: 'Ethereum' };
}

// ── 7. POST /api/swap — Get swap quote (real rates, routed via a dApp) ──
app.post('/api/swap', (req, res) => {
  const { fromToken, toToken, amount, walletAddress } = req.body;
  if (!fromToken || !toToken || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields: fromToken, toToken, amount' });
  }

  const from = String(fromToken).toUpperCase();
  const to = String(toToken).toUpperCase();
  const fromPrice = getTokenPriceUSD(from);
  const toPrice = getTokenPriceUSD(to);
  const slippage = 0.005; // 0.5% slippage
  const convenienceFeePct = 0.01; // 1% convenience fee
  const gasFee = 0.002 + Math.random() * 0.008; // $0.002–$0.01 gas
  const exchangeRate = toPrice > 0 && fromPrice > 0 ? fromPrice / toPrice : 0.85 + Math.random() * 0.3;
  const router = pickRouter(from, to);

  // Calculate output with slippage and convenience fee
  const estimatedOutputBeforeFee = parseFloat(amount) * exchangeRate * (1 - slippage);
  const convenienceFeeAmount = estimatedOutputBeforeFee * convenienceFeePct;
  const estimatedOutput = (estimatedOutputBeforeFee - convenienceFeeAmount).toFixed(6);

  return res.json({
    success: true,
    data: {
      fromToken: from,
      toToken: to,
      inputAmount: parseFloat(amount),
      estimatedOutput: parseFloat(estimatedOutput),
      exchangeRate: +exchangeRate.toFixed(8),
      slippage: `${(slippage * 100).toFixed(1)}%`,
      convenienceFee: `1.0% ($${convenienceFeeAmount.toFixed(2)})`,
      gasFee: `$${gasFee.toFixed(4)}`,
      priceImpact: `${(Math.random() * 0.3).toFixed(2)}%`,
      expiresIn: 30,
      route: `${router.dapp} (${router.chain})`,
      router: router.dapp,
      chain: router.chain,
    }
  });
});

// ── 8. POST /api/swap/execute — Execute swap ──
app.post('/api/swap/execute', async (req, res) => {
  const { fromToken, toToken, amount, walletAddress, estimatedOutput } = req.body;
  if (!fromToken || !toToken || !amount || !walletAddress) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Simulate blockchain confirmation delay (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  // Log convenience fee (1%) to the admin revenue ledger
  const feeRaw = parseFloat(amount) * 0.01;
  const priceUSD = getTokenPriceUSD(fromToken);
  await recordRevenue({
    source_type: 'swap_convenience_fee',
    amount_raw: feeRaw,
    amount_usd: feeRaw * priceUSD,
    token_symbol: fromToken || 'USDT',
    fee_percent: 1.0,
  });

  // Generate mock transaction hash
  const chars = '0123456789abcdef';
  let txHash = '0x';
  for (let i = 0; i < 64; i++) txHash += chars[Math.floor(Math.random() * 16)];

  // Record platform revenue event in real-time (1% convenience fee)
  const usdValue = estimateUSDValue(fromToken, amount);
  await recordRevenue({
    source_type: 'swap_convenience_fee',
    amount_raw: parseFloat(amount) * 0.01,
    amount_usd: +((usdValue * 0.01)).toFixed(4),
    token_symbol: fromToken,
    fee_percent: 1.0,
  });

  return res.json({
    success: true,
    data: {
      transactionHash: txHash,
      status: 'confirmed',
      fromToken,
      toToken,
      inputAmount: parseFloat(amount),
      outputAmount: parseFloat(estimatedOutput || amount) * (0.98 + Math.random() * 0.02),
      gasFee: '$' + (0.002 + Math.random() * 0.008).toFixed(4),
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(19000000 + Math.random() * 1000000)
    }
  });
});

// ══════════════════════════════════════════
//  REAL ON-CHAIN LAYER (non-custodial)
// ══════════════════════════════════════════
// The client derives + signs transactions locally (keys NEVER leave the device).
// These endpoints only (a) forward EVM JSON-RPC calls to Alchemy and (b) proxy
// the free ParaSwap DEX-aggregator API. No API key is exposed to the frontend.

// ── EVM JSON-RPC proxy — nonce, gas, estimate, broadcast, receipt ──
app.post('/api/evm/rpc', async (req, res) => {
  const { chainId, method, params = [] } = req.body || {};
  const chain = CHAIN_LIST.find((c) => c.kind === 'evm' && c.chainId === Number(chainId));
  if (!chain) {
    return res.status(400).json({ success: false, error: `Unknown EVM chainId: ${chainId}` });
  }
  try {
    const result = await rpc(chain.slug, chain.keyIndex, method, params);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Real swap quote (ParaSwap — free, no API key, real DEX routes) ──
app.get('/api/swap/quote', async (req, res) => {
  const { srcToken, destToken, amount, srcDecimals = 18, destDecimals = 18, network = 1, side = 'SELL' } = req.query;
  if (!srcToken || !destToken || !amount) {
    return res.status(400).json({ success: false, error: 'srcToken, destToken and amount are required' });
  }
  try {
    const { data } = await axios.get('https://apiv5.paraswap.io/prices', {
      params: { srcToken, destToken, amount, srcDecimals, destDecimals, side, network },
      timeout: 20000,
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(502).json({ success: false, error: (err.response && err.response.data && err.response.data.error) || err.message });
  }
});

// ── Build swap transaction calldata (ParaSwap) ──
app.post('/api/swap/build', async (req, res) => {
  const { srcToken, destToken, srcAmount, destAmount, userAddress, priceRoute, srcDecimals = 18, destDecimals = 18, network = 1 } = req.body || {};
  if (!srcToken || !destToken || !srcAmount || !destAmount || !userAddress || !priceRoute) {
    return res.status(400).json({ success: false, error: 'Missing swap build parameters' });
  }
  try {
    const { data } = await axios.post(
      `https://apiv5.paraswap.io/transactions/${srcToken}?network=${network}`,
      { srcToken, destToken, srcAmount, destAmount, userAddress, priceRoute, srcDecimals, destDecimals },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(502).json({ success: false, error: (err.response && err.response.data && err.response.data.error) || err.message });
  }
});

// ── Get ParaSwap router address for a network (allowance target) ──
app.get('/api/swap/addresses', async (req, res) => {
  const network = Number(req.query.network) || 1;
  try {
    const { data } = await axios.get('https://apiv5.paraswap.io/addresses', {
      params: { network },
      timeout: 15000,
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(502).json({ success: false, error: (err.response && err.response.data && err.response.data.error) || err.message });
  }
});

// ──────── OTP Store and Resend Integration ────────
// ──────── OTP, Session & User Registries ────────
const crypto = require('crypto');

const otpStore = {};
const usersStore = {};

// Helper to verify Telegram Widget authentic signatures
function verifyTelegramAuth(data, botToken) {
  const { hash, ...dataCheck } = data;
  if (!hash || !botToken) return false;

  const dataCheckArr = Object.keys(dataCheck)
    .sort()
    .map(key => `${key}=${dataCheck[key]}`);
  
  const dataCheckString = dataCheckArr.join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}

// ── 1. POST /api/auth/register — Save credentials
app.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  // Save/overwrite user
  usersStore[email] = {
    email,
    username,
    password,
    wallets: []
  };

  return res.json({ success: true, message: 'Account details registered successfully' });
});

// ── 2. POST /api/auth/send-otp — Dispatch OTP via Resend
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = code;

  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'CloudVoid <verify@cloudvoid.online>',
      to: [email],
      subject: 'Your CloudVoid Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0c0b15; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #332766;">
          <h2 style="color: #10b981; text-align: center;">CloudVoid Security OTP</h2>
          <p>Please use the following 6-digit verification code to complete your registration or login:</p>
          <div style="background-color: #18152e; border: 1px solid #4c3b8a; border-radius: 8px; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #10b981; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`OTP sent to ${email}. Response:`, response.data);
    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend API Error:', error.response?.data || error.message);
    console.log(`[DEV FALLBACK] Code for ${email} is: ${code}`);
    return res.json({ 
      success: true, 
      message: 'OTP sent (Sandbox Mode)', 
      fallbackCode: code
    });
  }
});

// ── 3. POST /api/auth/verify-otp — Validate OTP code
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, error: 'Email and code are required' });
  }

  const actualCode = otpStore[email];
  if (actualCode && actualCode === code) {
    delete otpStore[email];
    return res.json({ success: true, message: 'OTP verified successfully' });
  }

  return res.status(400).json({ success: false, error: 'Invalid verification code' });
});

// ── 4. POST /api/auth/google-login — Authentic Google token validator
app.post('/api/auth/google-login', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Google OAuth token is required' });
  }

  try {
    // Authenticate token against Google userinfo API
    const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const { email, name, sub } = googleResponse.data;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Failed to retrieve email profile from Google OAuth.' });
    }

    if (!usersStore[email]) {
      // Auto-register new OAuth user
      usersStore[email] = {
        email,
        username: name?.replace(/\s+/g, '').toLowerCase() || `user_${sub?.slice(-6)}`,
        password: crypto.randomBytes(16).toString('hex'),
        wallets: []
      };
    }

    const user = usersStore[email];
    return res.json({
      success: true,
      userId: '0x' + crypto.createHash('sha256').update(email).digest('hex'),
      email: user.email,
      username: user.username
    });
  } catch (err) {
    console.error('Google Auth Validation Failure:', err.response?.data || err.message);
    return res.status(401).json({ success: false, error: 'Google login token validation failed.' });
  }
});

// ── 5. POST /api/auth/telegram-login — Authentic Telegram signature validator
app.post('/api/auth/telegram-login', (req, res) => {
  const { tgData } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '7183901234:AAEg_mock_telegram_bot_token';

  if (!tgData) {
    return res.status(400).json({ success: false, error: 'Telegram authentication data is required' });
  }

  const isSignatureValid = verifyTelegramAuth(tgData, botToken);
  if (!isSignatureValid) {
    return res.status(401).json({ success: false, error: 'Telegram authentic signature validation failed' });
  }

  const email = `${tgData.username || tgData.id}@telegram.cloudvoid.online`;
  if (!usersStore[email]) {
    usersStore[email] = {
      email,
      username: tgData.username || `tg_${tgData.id}`,
      password: crypto.randomBytes(16).toString('hex'),
      wallets: []
    };
  }

  const user = usersStore[email];
  return res.json({
    success: true,
    userId: '0x' + crypto.createHash('sha256').update(email).digest('hex'),
    email: user.email,
    username: user.username
  });
});

// ── 6. POST /api/auth/passkey-login — Biometric authentication session
app.post('/api/auth/passkey-login', (req, res) => {
  const { deviceAuth } = req.body;
  if (!deviceAuth) {
    return res.status(400).json({ success: false, error: 'Biometric authorization parameters missing' });
  }

  // Retrieve first user in registry for biometric setup login mapping
  const users = Object.values(usersStore);
  if (users.length === 0) {
    return res.status(400).json({ success: false, error: 'No user registered on this device. Please log in with email first.' });
  }

  const user = users[0];
  return res.json({
    success: true,
    userId: '0x' + crypto.createHash('sha256').update(user.email).digest('hex'),
    email: user.email,
    username: user.username
  });
});

app.post('/api/derive-monero', async (req, res) => {
  const { mnemonic } = req.body;
  if (!mnemonic) {
    return res.status(400).json({ error: "Mnemonic is required" });
  }
  try {
    const bip39 = require('bip39');
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const crypto = require('crypto');
    const spendSecret = crypto.createHash('sha256').update(seed).digest();
    const viewSecret = crypto.createHash('sha256').update(spendSecret).digest();
    const spendPublic = crypto.createHash('sha256').update(spendSecret).digest();
    const viewPublic = crypto.createHash('sha256').update(viewSecret).digest();
    const xmrAddress = '4' + crypto.createHash('sha512').update(seed).digest('hex').slice(0, 94);
    
    return res.json({
      address: xmrAddress,
      spendSecret: spendSecret.toString('hex'),
      viewSecret: viewSecret.toString('hex'),
      spendPublic: spendPublic.toString('hex'),
      viewPublic: viewPublic.toString('hex'),
      balance: 0.00
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zero-Token AI Concierge V5 running on port ${PORT}`);
});
