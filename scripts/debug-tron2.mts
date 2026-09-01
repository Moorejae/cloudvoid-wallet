import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { mnemonicToSeedSync } from 'bip39';
import { ethers } from 'ethers';

const bip32 = BIP32Factory(ecc);
const root = bip32.fromSeed(
  mnemonicToSeedSync('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
);
const node = root.derivePath("m/44'/195'/0'/0/0");
console.log('privBuffer type:', node.privateKey === null ? 'null' : Array.isArray(node.privateKey) ? 'array' : (node.privateKey as any).constructor?.name, 'len:', node.privateKey ? node.privateKey.length : 'none');
console.log('privBuffer hex:', node.privateKey ? Buffer.from(node.privateKey as any).toString('hex') : 'none');
const priv = node.privateKey ? Buffer.from(node.privateKey as any).toString('hex') : '';
console.log('priv string len:', priv.length);
const w = new ethers.Wallet('0x' + priv);
console.log('publicKey type:', typeof w.publicKey, 'len:', w.publicKey.length, 'head:', w.publicKey.slice(0, 12));
let pub = w.publicKey.slice(2);
if (pub.length === 128) pub = '04' + pub;
console.log('pub hex len:', pub.length);
const hash = ethers.keccak256('0x' + pub);
console.log('keccak len:', hash.length);
const addr20 = hash.slice(26);
console.log('addr20 len:', addr20.length, addr20);
const versioned = '41' + addr20;
console.log('versioned len:', versioned.length, versioned);
const s1 = ethers.sha256('0x' + versioned);
console.log('s1 ok:', s1.length);
const s2 = ethers.sha256(s1);
const checksum = s2.slice(2, 10);
console.log('checksum:', checksum);
