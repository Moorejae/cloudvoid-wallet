import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { ethers } from 'ethers';
// @ts-ignore - Assuming these will be polyfilled or mocked if native modules fail
import * as bitcoin from 'bitcoinjs-lib';

// Initialize BIP32
const bip32 = BIP32Factory(ecc);

export interface DerivedWallet {
  network: string;
  address: string;
  privateKey: string;
}

/**
 * Generates a new 12-word BIP-39 mnemonic phrase.
 */
export function generateNewSeedPhrase(): string {
  return generateMnemonic(128); // 128 bits = 12 words
}

/**
 * Derives multi-chain wallets from a standard BIP-39 mnemonic phrase.
 * This function returns the public addresses and private keys. 
 * WARNING: Private keys must be immediately encrypted via SecureStore.
 */
export function deriveWalletsFromSeed(mnemonic: string): DerivedWallet[] {
  const seed = mnemonicToSeedSync(mnemonic);
  const rootNode = bip32.fromSeed(seed);
  
  const wallets: DerivedWallet[] = [];

  // 1. Ethereum / EVM Compatible (Base, BSC, Polygon, Celo)
  // Derivation path: m/44'/60'/0'/0/0
  const evmNode = rootNode.derivePath("m/44'/60'/0'/0/0");
  const evmPrivateKey = evmNode.privateKey?.toString('hex');
  if (evmPrivateKey) {
    const evmWallet = new ethers.Wallet(evmPrivateKey);
    wallets.push({
      network: 'EVM (Base/ETH/BSC)',
      address: evmWallet.address,
      privateKey: evmPrivateKey
    });
  }

  // 2. Bitcoin (Native SegWit)
  // Derivation path: m/84'/0'/0'/0/0
  const btcNode = rootNode.derivePath("m/84'/0'/0'/0/0");
  if (btcNode.publicKey) {
    const { address } = bitcoin.payments.p2wpkh({ pubkey: btcNode.publicKey, network: bitcoin.networks.bitcoin });
    wallets.push({
      network: 'Bitcoin',
      address: address || '',
      privateKey: btcNode.privateKey?.toString('hex') || ''
    });
  }

  // 3. Solana
  // Solana uses Ed25519, which isn't standard BIP32. Usually requires ed25519-hd-key.
  // Mocking for now to avoid native crypto crash before polyfills are fully verified.
  wallets.push({
    network: 'Solana',
    address: 'mock_solana_address_' + seed.subarray(0, 4).toString('hex'),
    privateKey: 'mock_sol_priv'
  });

  // 4. Tron
  // Tron uses same secp256k1 as Ethereum, but different address format (Base58check)
  const tronNode = rootNode.derivePath("m/44'/195'/0'/0/0");
  wallets.push({
    network: 'Tron',
    address: 'Tmock_tron_address_' + seed.subarray(0, 4).toString('hex'),
    privateKey: tronNode.privateKey?.toString('hex') || ''
  });

  return wallets;
}
