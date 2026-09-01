/**
 * check-xlm.mts — Verify Stellar strkey encoding against the official test vector:
 *   encodeCheck(account, 32 zero bytes) === 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
 */
import { deriveAllChainAddresses } from '../src/services/wallet/derive';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(input: Uint8Array): string {
  let bits = 0, value = 0, out = '';
  for (let i = 0; i < input.length; i++) {
    value = (value << 8) | input[i];
    bits += 8;
    while (bits >= 5) { out += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}
function crc16(data: Uint8Array): number {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}
function strkey(pub32: Uint8Array): string {
  const payload = new Uint8Array([0x30, ...pub32]);
  const crc = crc16(payload);
  // Stellar appends the CRC little-endian (writeUInt16LE).
  const full = new Uint8Array([...payload, crc & 0xff, (crc >> 8) & 0xff]);
  return base32Encode(full);
}

// 1) base32 RFC 4648 vector: "foobar" -> "MZXW6YTBOI"
const b32 = base32Encode(new TextEncoder().encode('foobar'));
console.log('base32("foobar") =', b32, '| matches MZXW6YTBOI:', b32 === 'MZXW6YTBOI' ? 'YES ✅' : 'NO ❌');

// 2) CRC16/XMODEM check value: "123456789" -> 0x31C3
const crc = crc16(new TextEncoder().encode('123456789'));
console.log('crc16("123456789") =', crc.toString(16).toUpperCase(), '| matches 31C3:', crc === 0x31c3 ? 'YES ✅' : 'NO ❌');

// 3) Stellar StrKey official vector: 32 zero bytes + version 0x30
const expected = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
const actual = strkey(new Uint8Array(32));
console.log('strkey(32 zeros):', actual);
console.log('matches official vector:', actual === expected ? 'YES ✅' : 'NO ❌');

// 4) derived test-vector address
const chains = deriveAllChainAddresses('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
console.log('derived xlm:', chains.xlm?.address);
process.exit(actual === expected ? 0 : 1);
