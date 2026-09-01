/**
 * test-riverbed-web.mts — Browser-faithful riverbed round-trip test.
 *
 * Runs the REAL frontend module (src/services/crypto/riverbed.ts) under Node's
 * WebCrypto, exercising the exact code path the Cloudflare-hosted browser uses:
 *   fetch pubkey -> ECDH session -> encrypt envelope -> POST -> decrypt reply.
 *
 * Run: npx tsx scripts/test-riverbed-web.mts
 */

import { createSession, encryptPayload, decryptPayload } from '../src/services/crypto/riverbed';

const BASE = process.env.API_BASE || 'http://localhost:3000';

async function main() {
  const pub = await (await fetch(`${BASE}/api/riverbed/pubkey`)).json();
  console.log('[1] server pubkey (first 32 chars):', pub.publicKey.slice(0, 32) + '...');

  const session = await createSession(pub.publicKey);
  console.log('[2] client session created with WebCrypto (the code the browser runs)');

  const envelope = await encryptPayload(session, { hello: 'cloudvoid-web', clientTs: Date.now() });
  const resp = await fetch(`${BASE}/api/riverbed/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });
  const respEnvelope = await resp.json();
  const plain = await decryptPayload(session, respEnvelope);
  console.log('[3] decrypted server response:', JSON.stringify(plain));

  const health = await (
    await fetch(`${BASE}/api/health/chains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
  ).json();
  console.log('[4] POST /api/health/chains reachable:', health.success === true ? 'yes' : 'no');

  if (plain.pong === true) {
    console.log('\nWEB RIVERBED ROUND-TRIP: PASS ✅');
  } else {
    throw new Error('expected pong=true');
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
