/**
 * balanceService.js — Real on-chain balances for all 15 chains.
 *
 * Addresses are PUBLIC (derived on the client, sent through the riverbed
 * envelope). The backend NEVER sees private keys or mnemonics.
 *
 * Sources:
 *   EVM (eth, poly, bnb, opbnb, avax, mnt, plasma)  -> Alchemy eth_getBalance
 *   Solana                                         -> Alchemy getBalance
 *   Bitcoin                                        -> mempool.space
 *   Bitcoin Cash / Litecoin / Dogecoin             -> Blockchair
 *   Tron                                           -> TronGrid
 *   Aptos                                          -> Aptos fullnode REST
 *   Stellar                                        -> Horizon
 */

const axios = require('axios');
const { CHAINS } = require('../config/chains');
const { rpc } = require('./alchemyClient');

const BLOCKCHAIR_COIN = { bch: 'bitcoin-cash', ltc: 'litecoin', doge: 'dogecoin' };

async function evmBalance(chain, address) {
  const hex = await rpc(chain.slug, chain.keyIndex, 'eth_getBalance', [address, 'latest']);
  return Number(BigInt(hex)) / 10 ** chain.decimals;
}

async function solanaBalance(chain, address) {
  const lamports = await rpc(chain.slug, chain.keyIndex, 'getBalance', [address]);
  return (lamports && lamports.value) ? lamports.value / 1e9 : 0;
}

async function btcBalance(chain, address) {
  const { data } = await axios.get(`https://mempool.space/api/address/${address}`, { timeout: 10000 });
  const stats = data && data.chain_stats;
  return stats ? (stats.funded_txo_sum - stats.spent_txo_sum) / 1e8 : 0;
}

async function blockchairBalance(coin, address) {
  try {
    const { data } = await axios.get(`https://api.blockchair.com/${coin}/dashboards/address/${address}`, { timeout: 10000 });
    const d = data && data.data && data.data[address];
    return d && d.address ? d.address.balance / 1e8 : 0;
  } catch (err) {
    // Blockchair returns 430 when an address has no on-chain data (fresh address).
    const code = err.response && err.response.status;
    if (code === 430 || code === 404) return 0;
    throw err;
  }
}

async function tronBalance(chain, address) {
  const { data } = await axios.get(`https://api.trongrid.io/v1/accounts/${address}`, { timeout: 10000 });
  const acc = data && data.data && data.data[0];
  return acc ? Number(acc.balance || 0) / 1e6 : 0;
}

async function aptosBalance(chain, address) {
  try {
    const { data } = await axios.get(`https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}`, { timeout: 10000 });
    if (!data) return 0;
    const coins = data.coins || [];
    if (!coins.length) return 0;
    const value = Number(coins[0].coin && coins[0].coin.value || 0);
    return value / 1e8;
  } catch (err) {
    if (err.response && err.response.status === 404) return 0; // account not found
    throw err;
  }
}

async function stellarBalance(chain, address) {
  try {
    const { data } = await axios.get(`https://horizon.stellar.org/accounts/${address}`, { timeout: 10000 });
    const native = (data && data.balances || []).find((b) => b.asset_type === 'native');
    return native ? Number(native.balance) : 0;
  } catch (err) {
    const code = err.response && err.response.status;
    if (code === 404 || code === 400) return 0; // account not found / empty
    throw err;
  }
}

/**
 * Fetch real balances for a map of public addresses (keyed by chain id).
 * @param {Record<string,string>} addresses e.g. { eth: '0x...', btc: 'bc1...' }
 * @param {(symbol: string) => {usd?: number, change24h?: number}} getQuote
 * @returns {Promise<Record<string,{address,balance,usd,price,change24h,status,detail?}>>}
 */
async function getBalances(addresses, getQuote = () => ({})) {
  const result = {};
  await Promise.all(
    CHAINS.map(async (c) => {
      const address = addresses && addresses[c.id];
      if (!address) {
        result[c.id] = { address: null, balance: 0, usd: 0, price: 0, change24h: 0, status: 'no_address' };
        return;
      }
      try {
        let balance = 0;
        if (c.kind === 'evm') balance = await evmBalance(c, address);
        else if (c.kind === 'solana') balance = await solanaBalance(c, address);
        else if (c.kind === 'utxo') {
          balance = c.id === 'btc'
            ? await btcBalance(c, address)
            : await blockchairBalance(BLOCKCHAIR_COIN[c.id], address);
        } else if (c.kind === 'tron') balance = await tronBalance(c, address);
        else if (c.kind === 'aptos') balance = await aptosBalance(c, address);
        else if (c.kind === 'stellar') balance = await stellarBalance(c, address);

        const q = getQuote(c.symbol) || {};
        const price = q.usd || 0;
        const usd = balance * price;
        result[c.id] = {
          address,
          balance,
          usd,
          price,
          change24h: q.change24h || 0,
          status: 'ok',
        };
      } catch (err) {
        result[c.id] = { address, balance: 0, usd: 0, price: 0, change24h: 0, status: 'error', detail: err.message };
      }
    })
  );
  return result;
}

module.exports = { getBalances };
