/**
 * test-balances.mts — Validate the non-custodial balances endpoint through the
 * riverbed envelope, using real public addresses.
 *
 * Run: npx tsx scripts/test-balances.mts
 */

import { createSession, encryptPayload, decryptPayload } from '../src/services/crypto/riverbed';

const BASE = process.env.API_BASE || 'http://localhost:3000';

// Public test addresses (EVM chains share one address).
const ADDRESSES: Record<string, string> = {
  eth: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  poly: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  bnb: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  opbnb: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  avax: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  mnt: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  plasma: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  sol: 'So11111111111111111111111111111111111111112',
};

async function main() {
  const pub = await (await fetch(`${BASE}/api/riverbed/pubkey`)).json();
  const session = await createSession(pub.publicKey);
  const envelope = await encryptPayload(session, { addresses: ADDRESSES });
  const resp = await fetch(`${BASE}/api/wallet/balances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });
  const respEnv = await resp.json();
  const plain = (await decryptPayload(session, respEnv)) as any;
  console.log('success:', plain.success);
  for (const [id, b] of Object.entries(plain.balances) as any[]) {
    console.log(`${id.padEnd(6)} balance=${String(b.balance).padEnd(14)} usd=${b.usd.toFixed(2)} status=${b.status}`);
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
