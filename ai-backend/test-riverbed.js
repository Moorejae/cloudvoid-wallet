/**
 * test-riverbed.js — End-to-end riverbed envelope round-trip test.
 *
 * Mimics exactly what the browser client does (P-256 ECDH + HKDF-SHA256 +
 * AES-256-GCM) using Node's crypto, which implements the same standards as
 * WebCrypto. Run: node ai-backend/test-riverbed.js
 */

const crypto = require('crypto');
const axios = require('axios');

const BASE = 'http://localhost:3000';
const PROTOCOL = 'cloudvoid-riverbed-v1';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

async function main() {
  // 1. Server public key (SPKI DER, base64url)
  const { data: pk } = await axios.get(`${BASE}/api/riverbed/pubkey`);
  console.log('[1] server pubkey (spki) OK:', pk.publicKey.slice(0, 36) + '...');

  // 2. Client ephemeral P-256 keypair + raw point export
  const { publicKey: clientPub, privateKey: clientPriv } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });
  const jwk = clientPub.export({ format: 'jwk' });
  const rawPoint = Buffer.concat([
    Buffer.from([4]),
    Buffer.from(jwk.x, 'base64url'),
    Buffer.from(jwk.y, 'base64url'),
  ]);
  console.log('[2] client raw point (65 bytes):', rawPoint.length === 65);

  // 3. Import server public key
  const serverPub = crypto.createPublicKey({
    key: Buffer.from(pk.publicKey, 'base64url'),
    format: 'der',
    type: 'spki',
  });

  // 4. ECDH + HKDF
  const shared = crypto.diffieHellman({ privateKey: clientPriv, publicKey: serverPub });
  const encKey = crypto.hkdfSync('sha256', shared, Buffer.alloc(0), Buffer.from(PROTOCOL), 32);
  console.log('[3] shared secret + HKDF OK');

  // 5. Encrypt payload -> envelope
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);
  const payload = { hello: 'cloudvoid', clientTs: Date.now() };
  const ct = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(payload), 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  const envelope = {
    v: 1,
    clientPub: b64url(rawPoint),
    iv: iv.toString('base64url'),
    ct: ct.toString('base64url'),
    tag: tag.toString('base64url'),
  };

  // 6. Send to /api/riverbed/ping
  const { data: resp } = await axios.post(`${BASE}/api/riverbed/ping`, envelope);
  console.log('[4] server responded with envelope fields:', Object.keys(resp).join(','));

  // 7. Decrypt the server response
  const shared2 = crypto.diffieHellman({ privateKey: clientPriv, publicKey: serverPub });
  const decKey = crypto.hkdfSync('sha256', shared2, Buffer.alloc(0), Buffer.from(PROTOCOL), 32);
  const dec = crypto.createDecipheriv('aes-256-gcm', decKey, Buffer.from(resp.iv, 'base64url'));
  dec.setAuthTag(Buffer.from(resp.tag, 'base64url'));
  let plain = dec.update(Buffer.from(resp.ct, 'base64url'), null, 'utf8');
  plain += dec.final('utf8');
  console.log('[5] decrypted server response:', plain);
  console.log('\nRIVERBED ROUND-TRIP: PASS ✅');
}

main().catch((e) => {
  console.error('FAILED:', (e.response && e.response.data) || e.message);
  process.exit(1);
});
