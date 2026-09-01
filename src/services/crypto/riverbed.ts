/**
 * riverbed.ts — Client-side envelope crypto (WebCrypto, browser-safe).
 *
 * Mirrors ai-backend/services/riverbed.js:
 *   P-256 ECDH (ephemeral per session) + HKDF-SHA256 + AES-256-GCM.
 *
 * The Cloudflare frontend never holds the server's private key — it only ever
 * fetches the server's public key. Every payload to/from the backend travels as
 * an encrypted envelope.
 */

const PROTOCOL = 'cloudvoid-riverbed-v1';
const te = new TextEncoder();
const td = new TextDecoder();

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export interface Envelope {
  v: number;
  clientPub: string; // raw P-256 point (65 bytes), base64url
  iv: string; // base64url, 12 bytes
  ct: string; // base64url ciphertext
  tag: string; // base64url, 16 bytes
}

export interface RiverbedSession {
  keyPair: CryptoKeyPair;
  serverPub: CryptoKey;
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  buf.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Create a fresh session: ephemeral client keypair + server public key. */
export async function createSession(serverPublicKeyB64Url: string): Promise<RiverbedSession> {
  const keyPair = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )) as CryptoKeyPair;
  const serverPub = await crypto.subtle.importKey(
    'spki',
    toArrayBuffer(unb64url(serverPublicKeyB64Url)),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  return { keyPair, serverPub };
}

async function deriveAesKey(shared: ArrayBuffer): Promise<CryptoKey> {
  const hkdfKey = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: toArrayBuffer(new Uint8Array(0)),
      info: toArrayBuffer(te.encode(PROTOCOL)),
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function computeAesKey(session: RiverbedSession): Promise<CryptoKey> {
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: session.serverPub },
    session.keyPair.privateKey,
    256
  );
  return deriveAesKey(shared);
}

/** Encrypt an arbitrary payload into an envelope for the backend. */
export async function encryptPayload(session: RiverbedSession, payload: unknown): Promise<Envelope> {
  const rawPub = await crypto.subtle.exportKey('raw', session.keyPair.publicKey); // 65 bytes
  const aesKey = await computeAesKey(session);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const combined = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, aesKey, toArrayBuffer(te.encode(JSON.stringify(payload))))
  );
  const tag = combined.slice(combined.length - 16);
  const ct = combined.slice(0, combined.length - 16);
  return { v: 1, clientPub: b64url(rawPub), iv: b64url(iv), ct: b64url(ct), tag: b64url(tag) };
}

/** Decrypt an envelope received from the backend. */
export async function decryptPayload(session: RiverbedSession, envelope: Envelope): Promise<unknown> {
  const aesKey = await computeAesKey(session);
  const ct = unb64url(envelope.ct);
  const tag = unb64url(envelope.tag);
  const combined = new Uint8Array(ct.length + tag.length);
  combined.set(ct, 0);
  combined.set(tag, ct.length);

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(unb64url(envelope.iv)), tagLength: 128 },
    aesKey,
    toArrayBuffer(combined)
  );
  return JSON.parse(td.decode(plain));
}
