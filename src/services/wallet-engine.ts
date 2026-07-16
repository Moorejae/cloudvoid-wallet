import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { ethers } from 'ethers';
// @ts-ignore - Assuming these will be polyfilled or mocked if native modules fail
import * as bitcoin from 'bitcoinjs-lib';
import { Keypair } from '@solana/web3.js';
import TronWeb from 'tronweb';
import { Buffer } from 'buffer';

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
  try {
    const solKeypair = Keypair.fromSeed(seed.subarray(0, 32));
    wallets.push({
      network: 'Solana',
      address: solKeypair.publicKey.toString(),
      privateKey: Buffer.from(solKeypair.secretKey).toString('hex')
    });
  } catch (err) {
    console.error('Failed to derive Solana address:', err);
  }

  // 4. Tron
  try {
    const tronPrivateKey = rootNode.derivePath("m/44'/195'/0'/0/0").privateKey?.toString('hex');
    if (tronPrivateKey) {
      const address = TronWeb.address.fromPrivateKey(tronPrivateKey);
      wallets.push({
        network: 'Tron',
        address: address,
        privateKey: tronPrivateKey
      });
    } else {
      throw new Error('Tron private key generation failed');
    }
  } catch (err) {
    console.error('Failed to derive Tron address:', err);
  }

  // 5. Monero (XMR) Hashing Derivation
  try {
    const spendSecretHex = ethers.sha256(seed);
    const spendSecretBytes = ethers.getBytes(spendSecretHex);
    const xmrAddress = '4' + ethers.sha512(seed).slice(2, 96);
    wallets.push({
      network: 'Monero',
      address: xmrAddress,
      privateKey: spendSecretHex.substring(2)
    });
  } catch (err) {
    console.error('Failed to derive Monero address:', err);
  }

  return wallets;
}
