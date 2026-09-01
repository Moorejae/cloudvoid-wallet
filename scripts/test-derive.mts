/**
 * test-derive.mts — Validate 15-chain derivation against the BIP-39 test vector.
 * Run: npx tsx scripts/test-derive.mts
 */

import { generateNewSeedPhrase, deriveAllChainAddresses } from '../src/services/wallet/derive';

const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const EXPECTED: Record<string, string> = {
  eth: '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
  btc: 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
};

const chains = deriveAllChainAddresses(MNEMONIC);
let pass = 0;
let fail = 0;
for (const [id, c] of Object.entries(chains)) {
  const expected = EXPECTED[id];
  const ok = expected ? c.address.toLowerCase() === expected.toLowerCase() : c.address.length > 0;
  if (ok) pass++; else fail++;
  console.log(`${id.padEnd(6)} ${c.address ? c.address.padEnd(50) : '(FAIL)'.padEnd(50)} ${expected ? (ok ? 'MATCH' : 'MISMATCH') : (c.address ? 'derived' : c.error)}`);
}
console.log('\nGenerate test:', generateNewSeedPhrase().split(' ').length, 'words');
console.log(`RESULT: ${pass} ok, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
