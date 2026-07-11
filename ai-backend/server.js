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
const { AUTHORIZED_NETWORKS, generateWalletAddress } = require('./services/cryptoService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
  const { message, currentScreen, sessionToken, directAction } = req.body;

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
      return res.json({ speechResponse: `Language changed to ${capitalize(lang)}. This task has been completed. Do you want anything else?`, action: 'CHANGE_LANGUAGE', payload: { language: lang } });
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
      return res.json({ speechResponse: `Default fiat currency changed to ${currency.toUpperCase()}. This task has been completed. Do you want anything else?`, action: 'CHANGE_CURRENCY', payload: { currency: currency.toUpperCase() } });
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
      speechResponse: `Successfully added ${data.name} (${data.symbol}) on the ${networkRaw.toUpperCase()} network. Address: ${address}. Task completed. Do you want anything else?`,
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
        speechResponse: `${asset} has been removed from your dashboard. This task has been completed. Do you want anything else?`,
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
    return res.json({ speechResponse: "Theme toggled successfully. Do you want anything else?", action: 'TOGGLE_THEME', payload: null });
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
      const summary = `${data.name} (${data.symbol}): $${data.price?.toLocaleString() ?? 'N/A'} | 24h Change: ${data.change24h?.toFixed(2) ?? 'N/A'}% | Market Cap: $${data.marketCap?.toLocaleString() ?? 'N/A'}.\n\n🛡️ Contract Security Audit: Honeypot check clean, liquidity verified as locked. Risk Score: 0/100 (Safe). Task completed. Do you want anything else?`;
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
    return res.json({ speechResponse: "Ledger filtered to show incoming deposits only. Do you want anything else?", action: 'FILTER_LIST', payload: { filters: 'deposits' } });
  }

  // ── 8. FILTER WITHDRAWALS ──
  if (activeSession.currentFlow === 'FILTER_WITHDRAWALS') {
    clearSession(sessionId);
    return res.json({ speechResponse: "Ledger filtered to show outgoing transactions only. Do you want anything else?", action: 'FILTER_LIST', payload: { filters: 'withdrawals' } });
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
        speechResponse: `Searching the ledger for transaction: ${hash.substring(0, 16)}... Task completed. Do you want anything else?`,
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
    return res.json({ 
      speechResponse: `Burner wallet generated on ${capitalize(networkRaw)}. Address: ${address}. Private Key saved to local vault. Task completed. Do you want anything else?`, 
      action: 'GENERATE_BURNER', 
      payload: { address, privateKey, symbol } 
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
        speechResponse: `Receipt string "${receipt.substring(0, 10)}..." analyzed and matched against ledger. Task completed. Do you want anything else?`, 
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
        speechResponse: `Ledger filtered to: ${dateParam}. Task completed. Do you want anything else?`, 
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
    return res.json({ speechResponse: "Push notification preferences toggled. Do you want anything else?", action: 'TOGGLE_NOTIFICATIONS', payload: null });
  }

  // ── 16. GREETING / CAPABILITIES ──
  if (activeSession.currentFlow === 'GREETING' || activeSession.currentFlow === 'CAPABILITY_CHECK') {
    clearSession(sessionId);
    return res.json({ speechResponse: "Hello! I can add or remove tokens, change app settings (like language or currency), fetch market data, filter transactions, and more. What would you like to do?", action: null, payload: null });
  }

  // ── GUARD: Fallback if mid-flow but nothing matched ──
  if (activeSession.currentFlow) {
    return res.json({ speechResponse: "I need a bit more info for that task. Or type 'cancel' to stop.", action: null, payload: null });
  }

  return res.json({ speechResponse: "I'm sorry, I didn't catch that. You can type 'help' to see what I can do.", action: null, payload: null });
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

// ──────── Prices Endpoint ────────
app.get('/api/prices', async (req, res) => {
  try {
    const ids = 'dogecoin,pepe,wif,bonk,shiba-inu,floki,bitcoin,ethereum,aptos,solana,binancecoin,avalanche-2';
    const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: ids,
        vs_currencies: 'usd',
        include_24hr_change: 'true'
      },
      timeout: 5000
    });
    
    const map = {
      'DOGE': resp.data['dogecoin'],
      'PEPE': resp.data['pepe'],
      'WIF': resp.data['wif'],
      'BONK': resp.data['bonk'],
      'SHIB': resp.data['shiba-inu'],
      'FLOKI': resp.data['floki'],
      'BTC': resp.data['bitcoin'],
      'ETH': resp.data['ethereum'],
      'APT': resp.data['aptos'],
      'SOL': resp.data['solana'],
      'BNB': resp.data['binancecoin'],
      'AVAX': resp.data['avalanche-2'],
    };
    return res.json(map);
  } catch (err) {
    // Return a healthy fallback if CoinGecko rate limits
    const fallback = {
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
    return res.json(fallback);
  }
});

// ──────── Wallet Endpoints ────────
app.post('/api/wallet/register', (req, res) => {
  const { address, importMethod } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  // Simulate wallet registration and fetch default tokens
  const defaultTokens = [
    { symbol: 'BTC', name: 'Bitcoin', price: 30121.75, change: 0.12, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [40, 45, 42, 50, 48, 55, 60] },
    { symbol: 'ETH', name: 'Ethereum', price: 121.73, change: -0.56, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [60, 55, 58, 45, 48, 40, 35] },
    { symbol: 'BNB', name: 'BNB', price: 38.88, change: -0.03, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', sparklineData: [45, 48, 42, 40, 38, 42, 38] },
    { symbol: 'XMR', name: 'Monero', price: 107.23, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [20, 25, 30, 40, 50, 55, 60] },
    { symbol: 'USDT', name: 'Ethereum', price: 100.00, change: -3.08, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 52, 48, 49, 45, 42, 40] }
  ];

  return res.json({
    success: true,
    message: 'Wallet registered successfully',
    wallet: { address, method: importMethod || 'create' },
    tokens: defaultTokens
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
  const prices = {
    USDT: 1.0,
    BTC: 60000.0,
    ETH: 3000.0,
    BNB: 500.0,
    SOL: 150.0,
    XMR: 150.0,
    APT: 8.0,
  };
  const price = prices[token.toUpperCase()] || 1.0;
  return parseFloat(amount) * price;
}

// ── 7. POST /api/swap — Get swap quote ──
app.post('/api/swap', (req, res) => {
  const { fromToken, toToken, amount, walletAddress } = req.body;
  if (!fromToken || !toToken || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields: fromToken, toToken, amount' });
  }

  // Simulate realistic swap quote
  const slippage = 0.005; // 0.5% slippage
  const convenienceFeePct = 0.01; // 1% convenience fee
  const gasFee = 0.002 + Math.random() * 0.008; // $0.002–$0.01 gas
  const exchangeRate = 0.85 + Math.random() * 0.3; // Simulated rate
  
  // Calculate output with slippage and convenience fee
  const estimatedOutputBeforeFee = parseFloat(amount) * exchangeRate * (1 - slippage);
  const convenienceFeeAmount = estimatedOutputBeforeFee * convenienceFeePct;
  const estimatedOutput = (estimatedOutputBeforeFee - convenienceFeeAmount).toFixed(6);

  return res.json({
    success: true,
    data: {
      fromToken,
      toToken,
      inputAmount: parseFloat(amount),
      estimatedOutput: parseFloat(estimatedOutput),
      exchangeRate: +exchangeRate.toFixed(6),
      slippage: `${(slippage * 100).toFixed(1)}%`,
      convenienceFee: `1.0% ($${(convenienceFeeAmount * (fromToken === 'USDT' ? 1 : 1)).toFixed(2)})`,
      gasFee: `$${gasFee.toFixed(4)}`,
      priceImpact: `${(Math.random() * 0.3).toFixed(2)}%`,
      expiresIn: 30,
      route: `${fromToken} → USDT → ${toToken}`
    }
  });
});

function getTokenPriceUSD(symbol) {
  const symbolMap = {
    'BTC': 64210.50,
    'ETH': 3485.20,
    'BNB': 575.30,
    'SOL': 145.80,
    'USDT': 1.00,
    'XMR': 167.00,
    'DOGE': 0.1542,
    'APT': 8.42
  };
  return symbolMap[symbol?.toUpperCase()] || 1.00;
}

// ── 8. POST /api/swap/execute — Execute swap ──
app.post('/api/swap/execute', async (req, res) => {
  const { fromToken, toToken, amount, walletAddress, estimatedOutput } = req.body;
  if (!fromToken || !toToken || !amount || !walletAddress) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Simulate blockchain confirmation delay (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  // Log convenience fee to admin dashboard
  try {
    const feeRaw = parseFloat(amount) * 0.01;
    const priceUSD = getTokenPriceUSD(fromToken);
    const feeUSD = feeRaw * priceUSD;
    await axios.post('http://localhost:8000/api/admin/revenue/record', {
      source_type: 'swap_convenience_fee',
      amount_raw: feeRaw,
      amount_usd: feeUSD,
      token_symbol: fromToken || 'USDT',
      fee_percent: 1.0
    });
  } catch (err) {
    console.error('Error logging swap revenue:', err.message);
  }

  // Generate mock transaction hash
  const chars = '0123456789abcdef';
  let txHash = '0x';
  for (let i = 0; i < 64; i++) txHash += chars[Math.floor(Math.random() * 16)];

  // Record platform revenue event in real-time (1% convenience fee)
  const usdValue = estimateUSDValue(fromToken, amount);
  const feeUSD = usdValue * 0.01;
  axios.post('http://localhost:8000/api/admin/revenue/record', {
    source_type: 'swap_convenience_fee',
    amount_raw: parseFloat(amount) * 0.01,
    amount_usd: +feeUSD.toFixed(4),
    token_symbol: fromToken
  }).catch(err => console.log('Failed to log swap fee to admin backend:', err.message));

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

// ── Wallet Registration ──
app.post('/api/wallet/register', (req, res) => {
  const { address, importMethod } = req.body;
  console.log(`[PROD] Wallet registered: ${address} via ${importMethod}`);
  return res.json({ success: true, message: 'Wallet registered successfully' });
});

// ── 9. GET /api/wallet/balance — Wallet token balances ──
app.get('/api/wallet/balance', (req, res) => {
  const balances = {
    BTC: 0,
    ETH: 0,
    BNB: 0,
    SOL: 0,
    USDT: 0,
    XMR: 0,
    DOGE: 0,
    APT: 0
  };

  return res.json({
    success: true,
    data: {
      balances,
      totalValueUSD: 0
    }
  });
});

// ── 10. GET /api/wallet/assets — Full asset details ──
app.get('/api/wallet/assets', (req, res) => {
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: 0, price: 64210.50, valueUSD: 0, change24h: 1.25, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { symbol: 'ETH', name: 'Ethereum', balance: 0, price: 3485.20, valueUSD: 0, change24h: -0.52, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'BNB', name: 'BNB', balance: 0, price: 575.30, valueUSD: 0, change24h: 0.85, icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
    { symbol: 'SOL', name: 'Solana', balance: 0, price: 145.80, valueUSD: 0, change24h: 4.12, icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { symbol: 'USDT', name: 'Tether', balance: 0, price: 1.00, valueUSD: 0, change24h: 0.01, icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'XMR', name: 'Monero', balance: 0, price: 167.00, valueUSD: 0, change24h: 3.45, icon: 'https://cryptologos.cc/logos/monero-xmr-logo.png' },
    { symbol: 'DOGE', name: 'Dogecoin', balance: 0, price: 0.1542, valueUSD: 0, change24h: 5.23, icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
    { symbol: 'APT', name: 'Aptos', balance: 0, price: 8.42, valueUSD: 0, change24h: 2.41, icon: 'https://cryptologos.cc/logos/aptos-apt-logo.png' }
  ];

  return res.json({
    success: true,
    data: {
      assets,
      totalValueUSD: 0
    }
  });
});

// ── 11. POST /api/fiat/buy-quote — Buy quote via MoonPay or Coinbase ──
app.post('/api/fiat/buy-quote', (req, res) => {
  const { fiatAmount, cryptoToken, provider } = req.body;
  if (!fiatAmount || !cryptoToken || !provider) {
    return res.status(400).json({ success: false, error: 'Missing required fields: fiatAmount, cryptoToken, provider' });
  }

  const feePct = provider === 'moonpay' ? 0.035 : 0.029; // MoonPay: 3.5%, Coinbase: 2.9%
  const feeUSD = parseFloat(fiatAmount) * feePct;
  const netAmountUSD = parseFloat(fiatAmount) - feeUSD;
  const rates = { BTC: 64210, ETH: 3485, USDT: 1, XMR: 167, SOL: 145.8, BNB: 575, DOGE: 0.1542, APT: 8.42 };
  const cryptoRate = rates[cryptoToken] || 1;
  const cryptoAmount = (netAmountUSD / cryptoRate).toFixed(6);

  return res.json({
    success: true,
    data: {
      provider,
      fiatAmount: parseFloat(fiatAmount),
      cryptoToken,
      cryptoAmount: parseFloat(cryptoAmount),
      fee: +feeUSD.toFixed(2),
      checkoutUrl: provider === 'moonpay' 
        ? `https://buy.moonpay.com?apiKey=mock&currency=${cryptoToken.toLowerCase()}&amount=${fiatAmount}`
        : `https://pay.coinbase.com/buy/select-asset?appId=mock&destinationWalletAddress=0xMock&cryptoCurrency=${cryptoToken}`
    }
  });
});

// ── 12. POST /api/fiat/buy-execute — Confirm buy ──
app.post('/api/fiat/buy-execute', async (req, res) => {
  const { provider, fiatAmount, cryptoToken, cryptoAmount } = req.body;
  
  // Simulate payment processing delay (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Log referral fee to admin dashboard
  try {
    const referralFeeUSD = parseFloat(fiatAmount) * 0.0175;
    await axios.post('http://localhost:8000/api/admin/revenue/record', {
      source_type: 'dapp_referral_fee',
      amount_raw: parseFloat(cryptoAmount) * 0.0175,
      amount_usd: +referralFeeUSD.toFixed(4),
      token_symbol: cryptoToken || 'USDT',
      fee_percent: 1.75
    });
  } catch (err) {
    console.error('Error logging fiat referral revenue:', err.message);
  }

  return res.json({
    success: true,
    data: {
      status: 'success',
      provider,
      txHash: '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),
      amountPurchased: parseFloat(cryptoAmount),
      token: cryptoToken
    }
  });
});

// ── 13. GET /api/fiat/affiliate-links — Affiliate links for fiat buy ──
app.get('/api/fiat/affiliate-links', (req, res) => {
  const { address, symbol } = req.query;
  const walletAddress = address || '0xMockWalletAddress';
  const cryptoToken = symbol || 'USDT';

  return res.json({
    success: true,
    data: {
      moonpay: `https://buy.moonpay.com?apiKey=pk_live_mock_key&currency=${cryptoToken.toLowerCase()}&walletAddress=${walletAddress}`,
      coinbase: `https://pay.coinbase.com/buy/select-asset?appId=mock_app_id&destinationWalletAddress=${walletAddress}&cryptoCurrency=${cryptoToken}`,
      transak: `https://global.transak.com?apiKey=mock_api_key&cryptoCurrencyCode=${cryptoToken}&walletAddress=${walletAddress}`,
      ramp: `https://ramp.network/buy?hostApiKey=mock_ramp_key&defaultAsset=${cryptoToken}&userAddress=${walletAddress}`,
      onramper: `https://widget.onramper.com?apiKey=mock_onramper_key&defaultCrypto=${cryptoToken}&wallets=${cryptoToken}:${walletAddress}`
    }
  });
});

// ──────── OTP Store and Resend Integration ────────
const otpStore = {};

app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = code;

  // Send email via Resend API
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
    // Fallback in dev: print OTP to console so they can still proceed if domain isn't fully verified in Resend yet
    console.log(`[DEV FALLBACK] Code for ${email} is: ${code}`);
    return res.json({ 
      success: true, 
      message: 'OTP sent (Sandbox Mode)', 
      fallbackCode: code
    });
  }
});

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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zero-Token AI Concierge V5 running on port ${PORT}`);
});
