/**
 * Web-compatible shim for tiny-secp256k1.
 * Uses @noble/secp256k1 under the hood via pure JavaScript (no WASM).
 * This shim is used during the Expo web build to replace the native WASM module.
 */

// Use the noble/curves secp256k1 which is pure JS
const { secp256k1 } = require('@noble/curves/secp256k1');
const { Buffer } = require('buffer');

const CURVE_ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

function isValidPrivate(d) {
  if (!d || d.length !== 32) return false;
  const n = BigInt('0x' + Buffer.from(d).toString('hex'));
  return n > 0n && n < CURVE_ORDER;
}

function isValidPoint(p) {
  try {
    if (!p || (p.length !== 33 && p.length !== 65)) return false;
    secp256k1.ProjectivePoint.fromHex(Buffer.from(p).toString('hex'));
    return true;
  } catch {
    return false;
  }
}

function toBuffer(hex) {
  return Buffer.from(hex, 'hex');
}

module.exports = {
  isPoint: isValidPoint,

  isPrivate: isValidPrivate,

  pointCompress(p, compressed = true) {
    const pt = secp256k1.ProjectivePoint.fromHex(Buffer.from(p).toString('hex'));
    return toBuffer(pt.toHex(compressed));
  },

  pointFromScalar(d, compressed = true) {
    if (!isValidPrivate(d)) return null;
    const pt = secp256k1.ProjectivePoint.fromPrivateKey(d);
    return toBuffer(pt.toHex(compressed));
  },

  pointAdd(pA, pB, compressed = true) {
    try {
      const A = secp256k1.ProjectivePoint.fromHex(Buffer.from(pA).toString('hex'));
      const B = secp256k1.ProjectivePoint.fromHex(Buffer.from(pB).toString('hex'));
      const result = A.add(B);
      if (result.equals(secp256k1.ProjectivePoint.ZERO)) return null;
      return toBuffer(result.toHex(compressed));
    } catch {
      return null;
    }
  },

  pointAddScalar(p, tweak, compressed = true) {
    try {
      const pt = secp256k1.ProjectivePoint.fromHex(Buffer.from(p).toString('hex'));
      const tweakN = BigInt('0x' + Buffer.from(tweak).toString('hex'));
      if (tweakN >= CURVE_ORDER) return null;
      const G = secp256k1.ProjectivePoint.BASE;
      const result = pt.add(G.multiply(tweakN));
      if (result.equals(secp256k1.ProjectivePoint.ZERO)) return null;
      return toBuffer(result.toHex(compressed));
    } catch {
      return null;
    }
  },

  pointMultiply(p, tweak, compressed = true) {
    try {
      const pt = secp256k1.ProjectivePoint.fromHex(Buffer.from(p).toString('hex'));
      const tweakN = BigInt('0x' + Buffer.from(tweak).toString('hex'));
      if (tweakN === 0n || tweakN >= CURVE_ORDER) return null;
      const result = pt.multiply(tweakN);
      return toBuffer(result.toHex(compressed));
    } catch {
      return null;
    }
  },

  privateAdd(d, tweak) {
    try {
      const dN = BigInt('0x' + Buffer.from(d).toString('hex'));
      const tweakN = BigInt('0x' + Buffer.from(tweak).toString('hex'));
      const result = (dN + tweakN) % CURVE_ORDER;
      if (result === 0n) return null;
      const hex = result.toString(16).padStart(64, '0');
      return toBuffer(hex);
    } catch {
      return null;
    }
  },

  privateSub(d, tweak) {
    try {
      const dN = BigInt('0x' + Buffer.from(d).toString('hex'));
      const tweakN = BigInt('0x' + Buffer.from(tweak).toString('hex'));
      const result = ((dN - tweakN) % CURVE_ORDER + CURVE_ORDER) % CURVE_ORDER;
      if (result === 0n) return null;
      const hex = result.toString(16).padStart(64, '0');
      return toBuffer(hex);
    } catch {
      return null;
    }
  },

  sign(hash, x, extraData) {
    const sig = secp256k1.sign(hash, x, { extraEntropy: extraData });
    return Buffer.from(sig.toDERRawBytes());
  },

  signSchnorr(hash, x, extraData) {
    const sig = secp256k1.sign(hash, x, { extraEntropy: extraData, schnorr: true });
    return Buffer.from(sig.toCompactRawBytes());
  },

  verify(hash, Q, signature, strict = false) {
    try {
      const sig = secp256k1.Signature.fromDER(signature);
      const pubKey = secp256k1.ProjectivePoint.fromHex(Buffer.from(Q).toString('hex'));
      return secp256k1.verify(sig, hash, pubKey.toRawBytes(), { strict });
    } catch {
      return false;
    }
  },

  verifySchnorr(hash, Q, signature) {
    try {
      return secp256k1.verify(signature, hash, Q, { schnorr: true });
    } catch {
      return false;
    }
  },
};
