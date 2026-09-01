/**
 * riverbed.js — Server-side envelope crypto (Node).
 *
 * "Riverbed": the frontend (Cloudflare) and backend communicate ONLY through an
 * encrypted envelope, on top of TLS.
 *
 * Protocol:
 *   - Client generates an ephemeral ECDH (P-256) keypair per session.
 *   - Client fetches the server public key (SPKI DER, public — safe to share).
 *   - ECDH(clientPriv, serverPub) -> shared secret -> HKDF-SHA256 -> AES-256-GCM key.
 *   - Payloads travel as { v, clientPub, iv, ct, tag }.
 *
 * NOTE: P-256 is used instead of X25519 because browser WebCrypto (Cloudflare
 * frontend) supports ECDH/P-256 universally, whereas X25519 is only in very
 * recent browsers. Node supports both.
 *
 * The server PRIVATE key is the riverbed "master key" and lives ONLY on the
 * backend VPS (ai-backend/keys/server_ecdh.pem, chmod 600).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROTOCOL = 'cloudvoid-riverbed-v1';
const KEY_FILE = path.join(__dirname, '..', 'keys', 'server_ecdh.pem');

let cachedPrivateKey = null;

function loadOrCreateKeyPair() {
  if (cachedPrivateKey) return cachedPrivateKey;
  if (fs.existsSync(KEY_FILE)) {
    cachedPrivateKey = crypto.createPrivateKey(fs.readFileSync(KEY_FILE, 'utf8'));
  } else {
    const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
    fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    fs.writeFileSync(KEY_FILE, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
    cachedPrivateKey = privateKey;
    console.log('[Riverbed] Generated new server ECDH key at', KEY_FILE);
  }
  return cachedPrivateKey;
}

/** Public key of the server as SPKI DER base64url (safe to publish). */
function serverPublicKeyRaw() {
  const priv = loadOrCreateKeyPair();
  const pub = crypto.createPublicKey(priv);
  return Buffer.from(pub.export({ type: 'spki', format: 'der' })).toString('base64url');
}

/** Import a client raw P-256 point (65 bytes, 0x04 || x || y) as a KeyObject. */
function importClientPublicKey(clientPubRaw) {
  const raw = Buffer.from(clientPubRaw, 'base64url');
  if (raw.length !== 65 || raw[0] !== 0x04) {
    throw new Error('Invalid client public key (expected raw P-256 point)');
  }
  const x = raw.subarray(1, 33).toString('base64url');
  const y = raw.subarray(33, 65).toString('base64url');
  return crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x, y }, format: 'jwk' });
}

function deriveKey(sharedSecret) {
  return crypto.hkdfSync('sha256', sharedSecret, Buffer.alloc(0), Buffer.from(PROTOCOL), 32);
}

/** Decrypt an envelope produced by a client. Returns the parsed plaintext. */
function decryptEnvelope(envelope) {
  if (!envelope || !envelope.clientPub || !envelope.iv || !envelope.ct || !envelope.tag) {
    throw new Error('Malformed envelope');
  }
  const serverPriv = loadOrCreateKeyPair();
  const clientPubKey = importClientPublicKey(envelope.clientPub);
  const shared = crypto.diffieHellman({ privateKey: serverPriv, publicKey: clientPubKey });
  const key = deriveKey(shared);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
  let plain = decipher.update(Buffer.from(envelope.ct, 'base64url'), null, 'utf8');
  plain += decipher.final('utf8');
  return JSON.parse(plain);
}

/** Encrypt a response for a given client. */
function encryptForClient(clientPub, payload) {
  const serverPriv = loadOrCreateKeyPair();
  const clientPubKey = importClientPublicKey(clientPub);
  const shared = crypto.diffieHellman({ privateKey: serverPriv, publicKey: clientPubKey });
  const key = deriveKey(shared);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(payload), 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    clientPub,
    iv: iv.toString('base64url'),
    ct: ct.toString('base64url'),
    tag: tag.toString('base64url'),
  };
}

module.exports = { serverPublicKeyRaw, decryptEnvelope, encryptForClient };
