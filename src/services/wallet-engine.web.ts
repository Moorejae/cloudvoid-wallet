/**
 * wallet-engine.web.ts — Web wallet engine.
 *
 * The Cloudflare-hosted web wallet now supports full 15-chain derivation.
 * Security on web is provided by the encrypted vault (PBKDF2 + AES-256-GCM):
 * the mnemonic is stored encrypted in localStorage and only decrypted in-memory
 * with the user's vault password. Private keys never touch storage.
 */
export {
  generateNewSeedPhrase,
  deriveWalletsFromSeed,
  deriveAllChainAddresses,
} from './wallet/derive';
export type { DerivedWallet, DerivedChain } from './wallet/derive';
