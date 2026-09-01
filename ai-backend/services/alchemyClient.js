/**
 * alchemyClient.js — Alchemy JSON-RPC client (backend only).
 *
 * Auth (verified 2026-08-13): Alchemy's current `alch_...` API keys must be
 * sent as `Authorization: Bearer <key>` against `https://<slug>.g.alchemy.com/v2`.
 * The URL-path method (`.../v2/<key>`) returns 401; header auth returns 200 when
 * the network is enabled, 403 when the network is not enabled for that key.
 *
 * Keys are read from `ALCHEMY_API_KEYS` (comma-separated) and selected by index.
 * These keys NEVER leave this backend (they are not exposed to the frontend).
 */

const axios = require('axios');

const RAW_KEYS = (process.env.ALCHEMY_API_KEYS || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

function getKey(keyIndex) {
  if (RAW_KEYS.length === 0) {
    throw new Error('ALCHEMY_API_KEYS is not set in .env');
  }
  return RAW_KEYS[keyIndex % RAW_KEYS.length];
}

/**
 * Low-level JSON-RPC call.
 * @param {string} slug Alchemy network slug, e.g. 'eth-mainnet'
 * @param {number} keyIndex index into ALCHEMY_API_KEYS
 * @param {string} method JSON-RPC method
 * @param {Array}  params  JSON-RPC params
 * @returns {Promise<any>} the RPC `result`
 */
async function rpc(slug, keyIndex, method, params = []) {
  const url = `https://${slug}.g.alchemy.com/v2`;
  const key = getKey(keyIndex);
  const { data } = await axios.post(
    url,
    { jsonrpc: '2.0', id: Date.now(), method, params },
    {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );
  if (data && data.error) {
    const err = new Error(data.error.message || 'Alchemy RPC error');
    err.code = data.error.code;
    throw err;
  }
  return data && data.result;
}

/** Lightweight read method used by the health check, per chain kind. */
const HEALTH_METHOD = {
  evm: ['eth_blockNumber', []],
  utxo: ['getblockcount', []],
  solana: ['getHealth', []],
  tron: ['eth_blockNumber', []],
  aptos: ['eth_blockNumber', []], // Aptos is REST; non-403 status proves the network is provisioned
  stellar: ['eth_blockNumber', []],
};

/**
 * Ping a chain and classify connectivity:
 *  - up           : HTTP 200, valid JSON-RPC result
 *  - reachable    : provisioned but method not applicable to this chain kind
 *  - not_enabled  : key valid but network not enabled for that key (403)
 *  - error        : transport / auth failure
 */
async function ping(chain) {
  const [method, params] = HEALTH_METHOD[chain.kind] || ['eth_blockNumber', []];
  try {
    await rpc(chain.slug, chain.keyIndex, method, params);
    return { status: 'up', detail: null };
  } catch (err) {
    const code = err.response && err.response.status;
    if (code === 403) {
      return { status: 'not_enabled', detail: 'Network not enabled for this key (403)' };
    }
    if (code === 400 || code === 405) {
      return { status: 'reachable', detail: `${method} not supported on ${chain.kind} (${code})` };
    }
    return { status: 'error', detail: err.message };
  }
}

module.exports = { getKey, rpc, ping, keyCount: RAW_KEYS.length };
