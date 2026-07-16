const { ethers } = require('ethers');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const bitcoin = require('bitcoinjs-lib');
const { Keypair } = require('@solana/web3.js');
const { derivePath } = require('ed25519-hd-key');
const { TronWeb } = require('tronweb');

async function testDerivation() {
  const mnemonic = "test test test test test test test test test test test junk";
  const seed = await bip39.mnemonicToSeed(mnemonic);

  console.log("=== EVM ===");
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  console.log("ETH Address:", hdNode.address);

  console.log("\n=== BITCOIN ===");
  const root = bip32.fromSeed(seed);
  // m/84'/0'/0'/0/0 for Native Segwit
  const btcNode = root.derivePath("m/84'/0'/0'/0/0");
  const { address: btcAddress } = bitcoin.payments.p2wpkh({ pubkey: btcNode.publicKey });
  console.log("BTC Address:", btcAddress);

  console.log("\n=== SOLANA ===");
  const path = "m/44'/501'/0'/0'";
  const derivedSeed = derivePath(path, seed.toString('hex')).key;
  const solKeypair = Keypair.fromSeed(derivedSeed);
  console.log("SOL Address:", solKeypair.publicKey.toBase58());

  console.log("\n=== TRON ===");
  const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
  const tronAddress = tronWeb.address.fromPrivateKey(hdNode.privateKey.replace('0x', ''));
  console.log("TRX Address:", tronAddress);
}

testDerivation().catch(console.error);
