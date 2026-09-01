process.stdout.write('start\n');
try {
  const { BIP32Factory } = await import('bip32');
  const ecc = (await import('tiny-secp256k1')) as any;
  const bip39 = (await import('bip39')) as any;
  const m = (await import('tronweb')) as any;

  const T: any = m.TronWeb || m.default || m;
  const bip32 = BIP32Factory(ecc.default || ecc);
  const root = bip32.fromSeed(
    bip39.mnemonicToSeedSync('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
  );
  const n = root.derivePath("m/44'/195'/0'/0/0");
  const priv = n.privateKey?.toString('hex');
  process.stdout.write('priv len: ' + (priv?.length ?? 'none') + '\n');
  process.stdout.write('priv hex: ' + priv + '\n');
  process.stdout.write('TronWeb.address: ' + typeof T.address + ' / fromPrivateKey: ' + typeof T.address.fromPrivateKey + '\n');
  const out = T.address.fromPrivateKey(priv);
  process.stdout.write('out: ' + JSON.stringify(out) + ' (' + typeof out + ')\n');
} catch (e: any) {
  process.stdout.write('ERR: ' + (e?.stack || e?.message || String(e)) + '\n');
  process.exit(1);
}
process.exit(0);
