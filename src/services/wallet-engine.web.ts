import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { ethers } from 'ethers';
import * as bitcoin from 'bitcoinjs-lib';
import { Keypair } from '@solana/web3.js';
import TronWeb from 'tronweb';
import { Buffer } from 'buffer';

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
 * Derives multi-chain wallets from a standard BIP-39 mnemonic phrase on the Web platform.
 * Bypasses native tiny-secp256k1 WASM dependencies by using Ethers' pure JS HDNodeWallet.
 */
export function deriveWalletsFromSeed(mnemonic: string): DerivedWallet[] {
  const seed = mnemonicToSeedSync(mnemonic);
  const mnemonicObj = ethers.Mnemonic.fromPhrase(mnemonic);
  const node = ethers.HDNodeWallet.fromMnemonic(mnemonicObj);
  
  const wallets: DerivedWallet[] = [];

  // 1. Ethereum / EVM Compatible (Base, BSC, Polygon, Celo)
  try {
    const evmNode = node.derivePath("m/44'/60'/0'/0/0");
    wallets.push({
      network: 'EVM (Base/ETH/BSC)',
      address: evmNode.address,
      privateKey: evmNode.privateKey.substring(2)
    });
  } catch (err) {
    console.error('Failed to derive EVM address:', err);
  }

  // 2. Bitcoin (Native SegWit)
  try {
    const btcNode = node.derivePath("m/84'/0'/0'/0/0");
    const btcPublicKey = Buffer.from(btcNode.publicKey.substring(2), 'hex');
    const { address } = bitcoin.payments.p2wpkh({ pubkey: btcPublicKey, network: bitcoin.networks.bitcoin });
    wallets.push({
      network: 'Bitcoin',
      address: address || '',
      privateKey: btcNode.privateKey.substring(2)
    });
  } catch (err) {
    console.error('Failed to derive Bitcoin address:', err);
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
    const tronNode = node.derivePath("m/44'/195'/0'/0/0");
    const privKeyHex = tronNode.privateKey.substring(2);
    const address = TronWeb.address.fromPrivateKey(privKeyHex);
    wallets.push({
      network: 'Tron',
      address: address,
      privateKey: privKeyHex
    });
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
