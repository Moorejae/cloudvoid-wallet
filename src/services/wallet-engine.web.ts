/**
 * wallet-engine.web.ts
 *
 * Web-platform stub for the wallet engine.
 * 
 * The full wallet engine (wallet-engine.ts) relies on `tiny-secp256k1` which
 * uses WebAssembly — a security-sensitive native module not suitable for
 * browser execution where private keys could be exposed to XSS attacks.
 *
 * On web, wallet creation and seed phrase generation should always be performed
 * on the mobile app (iOS/Android) where keys are protected by the device secure
 * enclave (Expo SecureStore). This stub allows the web bundle to compile cleanly
 * without any native crypto dependencies.
 *
 * Metro automatically selects this file over wallet-engine.ts when bundling for web.
 */

export interface DerivedWallet {
  network: string;
  address: string;
  privateKey: string;
}

/**
 * Web stub — seed phrase generation is disabled in the browser for security.
 * Use the CloudVoid mobile app to create your wallet.
 */
export function generateNewSeedPhrase(): string {
  throw new Error(
    'Wallet creation is only available on the CloudVoid mobile app. ' +
    'Download the app to securely generate your seed phrase.'
  );
}

/**
 * Web stub — wallet derivation is disabled in the browser for security.
 * Use the CloudVoid mobile app to access your wallet.
 */
export function deriveWalletsFromSeed(_mnemonic: string): DerivedWallet[] {
  throw new Error(
    'Wallet access is only available on the CloudVoid mobile app. ' +
    'Download the app to securely access your wallets.'
  );
}
