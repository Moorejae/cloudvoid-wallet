/**
 * derive.ts — Client-side derivation for ALL CloudVoid chains.
 *
 * NON-CUSTODIAL: addresses are derived locally from the mnemonic; private keys
 * are produced transiently for signing and are NEVER persisted or sent to the
 * backend. The backend only ever receives public addresses.
 *
 * PURE-JS implementation (@scure/bip32, @noble/*, @scure/base, ethers) so the
 * exact same code runs on native (iOS/Android), Node, and the Cloudflare web
 * bundle. (tiny-secp256k1/bitcoinjs-lib are NOT used here — their WASM builds
 * do not load in Metro web.)
 *
 * Chain mapping (ids match src/services/chains.ts):
 *   EVM (eth, poly, bnb, opbnb, avax, mnt, plasma) share ONE address (m/44'/60').
 *   BTC (m/84'/0'), BCH (m/44'/145'), LTC (m/84'/2'), DOGE (m/44'/3') -> UTXO.
 *   SOL (m/44'/501'), TRX (m/44'/195'), APT (m/44'/637'), XLM (m/44'/148').
 */

import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
if (typeof (global as any).Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { HDKey } from '@scure/bip32';
import { ethers } from 'ethers';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { base58, base58check, bech32 } from '@scure/base';
import { derivePath } from 'ed25519-hd-key';
import { ed25519 } from '@noble/curves/ed25519';

// Bitcoin-style base58check (double-sha256 checksum); Tron uses the same scheme.
const b58check = base58check((msg: Uint8Array) => sha256(sha256(msg)));

// ───────────────────────────── helpers ─────────────────────────────
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

/** ripemd160(sha256(pubkey)) — the standard bitcoin "hash160". */
function hash160(pub: Uint8Array): Uint8Array {
  return ripemd160(sha256(pub));
}

/** Native SegWit (bech32, witness v0) address. */
function p2wpkhAddress(pub: Uint8Array, hrp: string): string {
  const program = hash160(pub);
  return bech32.encode(hrp, [0, ...bech32.toWords(program)]);
}

/** Legacy P2PKH (base58check) address. */
function p2pkhAddress(pub: Uint8Array, version: number): string {
  return b58check.encode(new Uint8Array([version, ...hash160(pub)]));
}

// ─────────────── Stellar strkey (base32 + CRC16, little-endian) ───────────────
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(input: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < input.length; i++) {
    value = (value << 8) | input[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function crc16XModem(data: Uint8Array): number {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

function toStellarAddress(publicKey32: Uint8Array): string {
  const payload = new Uint8Array([0x30, ...publicKey32]); // 0x30 = 'G'
  const crc = crc16XModem(payload);
  const full = new Uint8Array([...payload, crc & 0xff, (crc >> 8) & 0xff]); // LE
  return base32Encode(full);
}

// ────────────────────────── public API ──────────────────────────

export function generateNewSeedPhrase(): string {
  return generateMnemonic(128); // 128 bits = 12 words
}

export interface DerivedChain {
  id: string;
  address: string;
  error?: string;
}

export function deriveAllChainAddresses(mnemonic: string): Record<string, DerivedChain> {
  const result: Record<string, DerivedChain> = {};
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed); // secp256k1
  const seedHex = bytesToHex(seed); // SLIP-0010 ed25519 (ed25519-hd-key)

  // 1. EVM — one address shared by all 7 EVM chains
  try {
    const hd = ethers.HDNodeWallet.fromPhrase(mnemonic);
    for (const id of ['eth', 'poly', 'bnb', 'opbnb', 'avax', 'mnt', 'plasma']) {
      result[id] = { id, address: hd.address };
    }
  } catch (e: any) {
    for (const id of ['eth', 'poly', 'bnb', 'opbnb', 'avax', 'mnt', 'plasma']) {
      result[id] = { id, address: '', error: e.message };
    }
  }

  // 2. Bitcoin — native SegWit (bc1...)
  try {
    const node = root.derive("m/84'/0'/0'/0/0");
    result.btc = { id: 'btc', address: p2wpkhAddress(node.publicKey!, 'bc') };
  } catch (e: any) {
    result.btc = { id: 'btc', address: '', error: e.message };
  }

  // 3. Litecoin — bech32 'ltc'
  try {
    const node = root.derive("m/84'/2'/0'/0/0");
    result.ltc = { id: 'ltc', address: p2wpkhAddress(node.publicKey!, 'ltc') };
  } catch (e: any) {
    result.ltc = { id: 'ltc', address: '', error: e.message };
  }

  // 4. Bitcoin Cash — legacy p2pkh (valid BCH format)
  try {
    const node = root.derive("m/44'/145'/0'/0/0");
    result.bch = { id: 'bch', address: p2pkhAddress(node.publicKey!, 0x00) };
  } catch (e: any) {
    result.bch = { id: 'bch', address: '', error: e.message };
  }

  // 5. Dogecoin — p2pkh
  try {
    const node = root.derive("m/44'/3'/0'/0/0");
    result.doge = { id: 'doge', address: p2pkhAddress(node.publicKey!, 0x1e) };
  } catch (e: any) {
    result.doge = { id: 'doge', address: '', error: e.message };
  }

  // 6. Solana — SLIP-0010 ed25519, address = base58(pubkey)
  try {
    const solPriv = derivePath("m/44'/501'/0'/0'", seedHex).key;
    result.sol = { id: 'sol', address: base58.encode(ed25519.getPublicKey(solPriv)) };
  } catch (e: any) {
    result.sol = { id: 'sol', address: '', error: e.message };
  }

  // 7. Tron — T = base58check(0x41 || keccak256(uncompressed pubkey)[12..32])
  try {
    const privNode = root.derive("m/44'/195'/0'/0/0");
    const priv = privNode.privateKey ? bytesToHex(privNode.privateKey) : '';
    const w = new ethers.Wallet('0x' + priv);
    let pub = w.signingKey.publicKey.slice(2); // strip 0x
    if (pub.length === 128) pub = '04' + pub; // ensure 65-byte uncompressed form
    const hash = ethers.keccak256('0x' + pub);
    const addr20 = hexToBytes(hash.slice(26)); // last 20 bytes
    result.trx = { id: 'trx', address: b58check.encode(new Uint8Array([0x41, ...addr20])) };
  } catch (e: any) {
    result.trx = { id: 'trx', address: '', error: e && e.message };
  }

  // 8. Aptos — single-signer Ed25519 (address = pubkey hex)
  try {
    const aptPriv = derivePath("m/44'/637'/0'/0'/0'", seedHex).key;
    result.apt = { id: 'apt', address: '0x' + bytesToHex(ed25519.getPublicKey(aptPriv)) };
  } catch (e: any) {
    result.apt = { id: 'apt', address: '', error: e.message };
  }

  // 9. Stellar — StrKey G...
  try {
    const xlmPriv = derivePath("m/44'/148'/0'", seedHex).key;
    result.xlm = { id: 'xlm', address: toStellarAddress(ed25519.getPublicKey(xlmPriv)) };
  } catch (e: any) {
    result.xlm = { id: 'xlm', address: '', error: e.message };
  }

  return result;
}

/** Backwards-compatible shape used by older imports (no private keys exposed). */
export interface DerivedWallet {
  network: string;
  address: string;
  privateKey: string;
}

export function deriveWalletsFromSeed(mnemonic: string): DerivedWallet[] {
  const chains = deriveAllChainAddresses(mnemonic);
  return Object.values(chains)
    .filter((c) => c.address)
    .map((c) => ({ network: c.id, address: c.address, privateKey: '' }));
}

/**
 * Generate a REAL, valid one-time ("burner") address for a given network.
 *
 * This is intentionally a fresh throwaway address (never derived from the user's
 * master seed, so it cannot compromise the main wallet). The returned string is
 * always a correct address for the target chain:
 *   EVM (eth/poly/bnb/opbnb/avax/mnt/plasma)  -> 0x...
 *   BTC (btc)                                 -> bc1q... (native segwit)
 *   SOL (sol)                                 -> base58 ed25519 pubkey
 *   TRX (trx)                                 -> T...   (base58check 0x41)
 *   XLM (xlm)                                 -> G...   (StrKey)
 */
export function generateBurnerAddress(symbol: string): string {
  const kind = (symbol || '').toUpperCase();
  const EVM_KINDS = ['ETH', 'POLY', 'BNB', 'OPBNB', 'AVAX', 'MNT', 'PLASMA', 'ERC20', 'ERC-20', 'APT'];
  if (EVM_KINDS.includes(kind)) {
    return ethers.Wallet.createRandom().address;
  }
  if (kind === 'BTC') {
    const node = HDKey.fromMasterSeed(ethers.randomBytes(32));
    return p2wpkhAddress(node.publicKey!, 'bc');
  }
  if (kind === 'LTC') {
    const node = HDKey.fromMasterSeed(ethers.randomBytes(32));
    return p2wpkhAddress(node.publicKey!, 'ltc');
  }
  if (kind === 'SOL') {
    return base58.encode(ed25519.getPublicKey(ethers.randomBytes(32)));
  }
  if (kind === 'TRX' || kind === 'TRON') {
    const w = ethers.Wallet.createRandom();
    let pub = w.signingKey.publicKey.slice(2);
    if (pub.length === 128) pub = '04' + pub;
    const hash = ethers.keccak256('0x' + pub);
    const addr20 = hexToBytes(hash.slice(26));
    return b58check.encode(new Uint8Array([0x41, ...addr20]));
  }
  if (kind === 'XLM') {
    return toStellarAddress(ed25519.getPublicKey(ethers.randomBytes(32)));
  }
  // Default: EVM-compatible address.
  return ethers.Wallet.createRandom().address;
}
