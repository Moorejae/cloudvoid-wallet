/**
 * riverbedClient.ts — Envelope-wrapped HTTP client for the frontend.
 *
 * Every request/response to the backend travels as an AES-256-GCM envelope
 * (P-256 ECDH + HKDF-SHA256). The frontend only ever holds the server's public
 * key; the private "master" key stays on the backend VPS.
 */

import { Envelope, createSession, encryptPayload, decryptPayload } from '../crypto/riverbed';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('cloudvoid.online')
    ? 'https://api.cloudvoid.online'
    : 'http://localhost:3000');

export function getApiBase(): string {
  return API_BASE;
}

let session: Awaited<ReturnType<typeof createSession>> | null = null;

async function getSession() {
  if (session) return session;
  const res = await fetch(`${API_BASE}/api/riverbed/pubkey`);
  if (!res.ok) throw new Error(`riverbed pubkey fetch failed (${res.status})`);
  const data = await res.json();
  session = await createSession(data.publicKey);
  return session;
}

/**
 * POST an encrypted envelope to `path` and return the decrypted response.
 */
export async function envelopeRequest<T = unknown>(path: string, body?: unknown): Promise<T> {
  const s = await getSession();
  const envelope = await encryptPayload(s, body ?? {});
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });
  if (!res.ok) {
    throw new Error(`envelope request failed (${res.status}) for ${path}`);
  }
  const respEnvelope = (await res.json()) as Envelope;
  return (await decryptPayload(s, respEnvelope)) as T;
}

/** Force a fresh session (call after the backend rotates its riverbed key). */
export async function resetRiverbedSession(): Promise<void> {
  session = null;
}
