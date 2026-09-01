/**
 * test-fullflow.mts — Full Phase 1 pipeline:
 *   derive 15 chain addresses LOCALLY -> encrypt public addresses into a
 *   riverbed envelope -> POST /api/wallet/balances -> decrypt real balances.
 *
 * Run: npx tsx scripts/test-fullflow.mts
 */

import { deriveAllChainAddresses } from '../src/services/wallet/derive';
import { createSession, encryptPayload, decryptPayload } from '../src/services/crypto/riverbed';

const BASE = process.env.API_BASE || 'http://localhost:3000';
const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

async function main() {
  const chains = deriveAllChainAddresses(MNEMONIC);
  const addresses: Record<string, string> = {};
  for (const [id, c] of Object.entries(chains)) {
    if (c.address) addresses[id] = c.address;
  }
  console.log('[1] derived addresses for', Object.keys(addresses).length, 'chains (client-side, keys never leave device)');

  const pub = await (await fetch(`${BASE}/api/riverbed/pubkey`)).json();
  const session = await createSession(pub.publicKey);
  const envelope = await encryptPayload(session, { addresses });
  const resp = await fetch(`${BASE}/api/wallet/balances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });
  const respEnv = await resp.json();
  const plain = (await decryptPayload(session, respEnv)) as any;

  console.log('[2] real balances via encrypted envelope:');
  for (const [id, b] of Object.entries(plain.balances) as any[]) {
    console.log(`  ${id.padEnd(6)} ${String(b.balance).padEnd(14)} price=${String(b.price).padEnd(10)} change=${String(b.change24h).padEnd(6)} status=${b.status}`);
  }
  console.log('\nFULL FLOW (derive -> envelope -> real balances): PASS ✅');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
