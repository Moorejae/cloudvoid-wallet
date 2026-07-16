// intentEngine.js - Typo Tolerant NLP parser using Levenshtein Distance & Synonyms
// Built for Zero-Token AI Concierge V5

const INTENTS = {
  ADD_TOKEN: ['add', 'track', 'list', 'enable', 'show coin', 'include', 'import', 'import token', 'add token', 'track token', 'watch token', 'list token'],
  REMOVE_TOKEN: ['remove', 'delete', 'hide', 'take off', 'un-list', 'clear out', 'drop', 'remove token', 'hide token', 'delete token', 'un-track'],
  TOKEN_INFO: ['price', 'info', 'details', 'about', 'what is', 'tell me about', 'how much', 'rate', 'value', 'market price', 'price of', 'analysis', 'performance', 'gains', 'history of this coin', 'market cap', 'analytics', 'chart', 'trend', 'volume', '24h change', 'history', 'scam', 'legit', 'fake', 'warning', 'safe', 'is this safe', 'scam check', 'check scam', 'is it a scam', 'audit token', 'check contract', 'scam scan'],
  GENERATE_BURNER: ['burner', 'temporary address', 'disposable wallet', 'throwaway', 'create burner', 'generate burner', 'temp wallet', 'fresh wallet', 'disposable address'],
  FILTER_DEPOSITS: ['deposits', 'incoming', 'received', 'received transactions', 'view deposits', 'show deposits', 'filter deposits', 'credit', 'inflow', 'deposit'],
  FILTER_WITHDRAWALS: ['withdrawals', 'outgoing', 'sends', 'sent', 'spent', 'view withdrawals', 'show withdrawals', 'filter withdrawals', 'debit', 'outflow', 'withdrawal'],
  FILTER_BY_DATE: ['date', 'today', 'yesterday', 'last week', 'this month', 'time range', 'filter by date', 'last month', 'range', 'on monday', 'on tuesday', 'on wednesday', 'on thursday', 'on friday', 'on saturday', 'on sunday'],
  SEARCH_HASH: ['hash', 'txid', 'transaction id', 'specific transaction', 'find tx', 'search hash', 'lookup hash', 'lookup tx', 'transaction hash'],
  TOGGLE_THEME: ['theme', 'dark mode', 'light mode', 'appearance', 'switch theme', 'toggle theme', 'change theme', 'dark', 'light'],
  CHANGE_LANGUAGE: ['language', 'translate', 'locale', 'change language to', 'speak', 'switch language', 'set language', 'english', 'spanish', 'french', 'igbo', 'yoruba', 'hausa'],
  CHANGE_CURRENCY: ['currency', 'fiat', 'default money', 'change currency to', 'set currency', 'switch currency', 'usd', 'eur', 'gbp'],
  TOGGLE_NOTIFICATIONS: ['notification', 'alert', 'push', 'toggle notifications', 'disable notifications', 'enable notifications', 'mute', 'unmute'],
  PING_LATENCY: ['ping', 'latency', 'speed test', 'check ping', 'test speed', 'latency test', 'ping test'],
  SCAN_RECEIPT: ['scan receipt', 'receipt', 'invoice', 'read receipt', 'check receipt', 'upload receipt'],
  GREETING: ['hello', 'hi', 'hey', 'greetings', 'sup', 'yo', 'howdy'],
  CAPABILITY_CHECK: ['what can you do', 'help', 'show options', 'what are your powers', 'how can you help', 'features', 'capabilities', 'what do you do']
};

function levenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  return track[str2.length][str1.length];
}

// Typo-tolerant substring match (if Levenshtein distance relative to word length is small)
function fuzzyMatch(input, target) {
  const words = input.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  
  // Try exact sequence match first
  if (input.toLowerCase().includes(target.toLowerCase())) {
    return true;
  }
  
  // Check if any word has very low distance
  for (const w of words) {
    for (const tw of targetWords) {
      if (tw.length < 3) continue; // ignore tiny words
      const dist = levenshteinDistance(w, tw);
      const threshold = Math.max(1, Math.floor(tw.length * 0.3)); // 30% typo tolerance
      if (dist <= threshold) {
        return true;
      }
    }
  }
  return false;
}

function cleanString(input) {
  return input.toLowerCase().trim();
}

function extractAsset(text) {
  const match = text.match(/(btc|bitcoin|eth|ethereum|usdt|tether|bnb|shib|shiba|xmr|monero|celo|aptos|apt|sol|solana|rune|thorchain|trx|tron|doge|ada|matic|avax|dot|link)/i);
  return match ? match[1].toUpperCase() : null;
}

function extractNetwork(text) {
  const match = text.match(/(erc20|bep20|trc20|ethereum|eth|bsc|tron|bitcoin|btc|solana|sol|aptos|celo|monero|xmr|thorchain)/i);
  return match ? match[1].toLowerCase() : null;
}

function extractLanguage(text) {
  const match = text.match(/(mandarin|chinese|english|spanish|french|german|japanese|korean|igbo|yoruba|hausa|hindi|arabic|portuguese|russian)/i);
  return match ? match[1] : null;
}

function extractCurrency(text) {
  const match = text.match(/(usd|eur|gbp|jpy|aud|cad|chf|cny|inr|ngn|zar)/i);
  return match ? match[1].toUpperCase() : null;
}

function extractIntentAndEntities(text) {
  const clean = cleanString(text);
  let detectedAction = 'UNKNOWN';
  
  // Check burner specifically
  const isBurnerRelated = fuzzyMatch(clean, 'burner') || fuzzyMatch(clean, 'temporary wallet') || fuzzyMatch(clean, 'disposable address');
  if (isBurnerRelated) {
    detectedAction = 'GENERATE_BURNER';
  } else {
    // Loop through intents with fuzzy logic
    for (const [intent, keywords] of Object.entries(INTENTS)) {
      if (keywords.some(kw => fuzzyMatch(clean, kw))) {
        detectedAction = intent;
        break;
      }
    }
  }

  const entities = {
    asset: extractAsset(clean),
    network: extractNetwork(clean),
    language: extractLanguage(clean),
    currency: extractCurrency(clean),
  };

  return { action: detectedAction, entities };
}

module.exports = {
  cleanString,
  extractIntentAndEntities,
  extractAsset,
  extractNetwork,
  extractLanguage,
  extractCurrency
};
