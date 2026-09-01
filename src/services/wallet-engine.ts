/**
 * wallet-engine.ts — Native wallet engine.
 *
 * Re-exports the full client-side derivation for all 15 chains. NON-CUSTODIAL:
 * private keys are derived transiently for signing and never persisted; only
 * public addresses are stored (SecureStore on native).
 */
export {
  generateNewSeedPhrase,
  deriveWalletsFromSeed,
  deriveAllChainAddresses,
} from './wallet/derive';
export type { DerivedWallet, DerivedChain } from './wallet/derive';
