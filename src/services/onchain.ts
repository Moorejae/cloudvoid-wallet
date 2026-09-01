/**
 * onchain.ts — REAL on-chain EVM layer.
 *
 * Non-custodial: the mnemonic is loaded from the vault/SecureStore, private keys
 * are derived in memory, transactions are SIGNED LOCALLY, and only the signed
 * raw transaction is sent to our backend, which broadcasts it via Alchemy.
 * The backend never sees a private key.
 *
 * Swaps use the ParaSwap DEX aggregator (free, no API key) — real quotes and
 * real routes through Uniswap/Curve/etc. No platform fee is charged.
 */
import { ethers } from 'ethers';
import axios from 'axios';
import { API_BASE_URL } from './web3Api';
import { useWalletStore } from '../stores/walletStore';
import { loadMnemonic } from './wallet/storage';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

// ───────────────────────── EVM chain registry ─────────────────────────
export interface EvmChain {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  explorer: string;
}

export const EVM_CHAINS: EvmChain[] = [
  { id: 'eth',    name: 'Ethereum',        symbol: 'ETH',    chainId: 1,     decimals: 18, explorer: 'https://etherscan.io' },
  { id: 'poly',   name: 'Polygon',         symbol: 'POL',    chainId: 137,   decimals: 18, explorer: 'https://polygonscan.com' },
  { id: 'bnb',    name: 'BNB Smart Chain', symbol: 'BNB',    chainId: 56,    decimals: 18, explorer: 'https://bscscan.com' },
  { id: 'avax',   name: 'Avalanche',       symbol: 'AVAX',   chainId: 43114, decimals: 18, explorer: 'https://snowtrace.io' },
  { id: 'mnt',    name: 'Mantle',          symbol: 'MNT',    chainId: 5000,  decimals: 18, explorer: 'https://explorer.mantle.xyz' },
];

/** Map a dashboard token symbol to an EVM chain (native gas coin send). */
export function evmChainForSymbol(symbol: string): EvmChain | undefined {
  const s = (symbol || '').toUpperCase();
  if (s === 'MATIC') return EVM_CHAINS.find((c) => c.id === 'poly');
  if (s === 'PLASMA') return EVM_CHAINS.find((c) => c.id === 'plasma');
  return EVM_CHAINS.find((c) => c.symbol === s);
}

// ───────────────────────── EVM token registry (swap) ─────────────────────────
export const ETH_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export interface EvmToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
}

export const ETHEREUM_TOKENS: EvmToken[] = [
  { symbol: 'ETH',  name: 'Ethereum', address: ETH_SENTINEL,                                             decimals: 18, icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',             decimals: 6,  icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',              decimals: 6,  icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  { symbol: 'DAI',  name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',                    decimals: 18, icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',           decimals: 8,  icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png' },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',             decimals: 18, icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
];

// ───────────────────────── mnemonic / signer ─────────────────────────
/**
 * Returns the mnemonic, unlocking the web vault with the user's password if it
 * has not already been unlocked this session. Native reads from SecureStore.
 */
export async function getSigningMnemonic(password?: string): Promise<string> {
  const cached = useWalletStore.getState().mnemonic;
  if (cached) return cached;
  const m = await loadMnemonic(password);
  if (!m) throw new Error('No wallet found. Create or import a wallet first.');
  useWalletStore.getState().setMnemonic(m);
  return m;
}

export function evmSigner(mnemonic: string): ethers.HDNodeWallet {
  // Default path m/44'/60'/0'/0/0 — matches the wallet's derived EVM address.
  return ethers.Wallet.fromPhrase(mnemonic);
}

// ───────────────────────── EVM JSON-RPC proxy ─────────────────────────
export async function evmRpc(chainId: number, method: string, params: any[] = []): Promise<any> {
  const { data } = await api.post('/api/evm/rpc', { chainId, method, params });
  if (!data?.success) throw new Error(data?.error || 'EVM RPC call failed');
  return data.result;
}

// ───────────────────────── Real Send ─────────────────────────
export interface SendEvmParams {
  chainId: number;
  to: string;
  valueWei: string | bigint; // amount in wei (native gas token)
  password?: string;
}

export interface SendResult {
  txHash: string;
  explorer: string;
}

export async function sendEvm({ chainId, to, valueWei, password }: SendEvmParams): Promise<SendResult> {
  const mnemonic = await getSigningMnemonic(password);
  const signer = evmSigner(mnemonic);
  const chain = EVM_CHAINS.find((c) => c.chainId === chainId);
  if (!chain) throw new Error('Unsupported EVM chain');

  const from = signer.address;
  const nonce = await evmRpc(chainId, 'eth_getTransactionCount', [from, 'pending']);
  const gasPrice = await evmRpc(chainId, 'eth_gasPrice', []);
  const gasLimit = await evmRpc(chainId, 'eth_estimateGas', [{ from, to, value: ethers.toQuantity(ethers.getBigInt(valueWei)) }]);

  const raw = await signer.signTransaction({
    to,
    value: ethers.getBigInt(valueWei),
    nonce: ethers.getBigInt(nonce),
    gasPrice: ethers.getBigInt(gasPrice),
    gasLimit: ethers.getBigInt(gasLimit),
    chainId: ethers.getBigInt(chainId),
  } as any);

  const txHash = await evmRpc(chainId, 'eth_sendRawTransaction', [raw]);
  return { txHash: String(txHash), explorer: chain.explorer ? `${chain.explorer}/tx/${txHash}` : '' };
}

// ───────────────────────── Real Swap (ParaSwap) ─────────────────────────
export async function getAggregatorQuote(params: {
  srcToken: string;
  destToken: string;
  amount: string;
  srcDecimals?: number;
  destDecimals?: number;
  network?: number;
}): Promise<any> {
  const { data } = await api.get('/api/swap/quote', { params: { ...params, side: 'SELL' } });
  if (!data?.success) throw new Error(data?.error || 'Failed to fetch swap quote');
  return data.data;
}

export async function buildAggregatorTx(body: Record<string, unknown>): Promise<{
  to: string;
  data: string;
  value: string;
  allowanceTarget: string;
}> {
  const { data } = await api.post('/api/swap/build', body);
  if (!data?.success) throw new Error(data?.error || 'Failed to build swap transaction');
  return data.data;
}

export async function getAllowance(chainId: number, token: string, owner: string, spender: string): Promise<bigint> {
  const iface = new ethers.Interface(['function allowance(address owner, address spender) view returns (uint256)']);
  const callData = iface.encodeFunctionData('allowance', [owner, spender]);
  const hex = await evmRpc(chainId, 'eth_call', [{ to: token, data: callData }, 'latest']);
  return ethers.getBigInt(hex || '0x0');
}

export function buildApprovalTx(token: string, spender: string): { to: string; data: string } {
  const iface = new ethers.Interface(['function approve(address spender, uint256 amount) returns (bool)']);
  return { to: token, data: iface.encodeFunctionData('approve', [spender, ethers.MaxUint256]) };
}

export async function signAndSendTx(
  chainId: number,
  tx: { to: string; data?: string; value?: string },
  password?: string
): Promise<{ txHash: string }> {
  const mnemonic = await getSigningMnemonic(password);
  const signer = evmSigner(mnemonic);
  const nonce = await evmRpc(chainId, 'eth_getTransactionCount', [signer.address, 'pending']);
  const gasPrice = await evmRpc(chainId, 'eth_gasPrice', []);

  let gasLimit: bigint;
  try {
    const est = await evmRpc(chainId, 'eth_estimateGas', [
      { from: signer.address, to: tx.to, data: tx.data || '0x', value: tx.value || '0x0' },
    ]);
    gasLimit = ethers.getBigInt(est) * 130n / 100n + 1n;
  } catch {
    gasLimit = 700000n; // fallback for routers that fail gas estimation
  }

  const raw = await signer.signTransaction({
    to: tx.to,
    data: tx.data || '0x',
    value: ethers.getBigInt(tx.value || '0'),
    nonce: ethers.getBigInt(nonce),
    gasPrice: ethers.getBigInt(gasPrice),
    gasLimit,
    chainId: ethers.getBigInt(chainId),
  } as any);

  const txHash = await evmRpc(chainId, 'eth_sendRawTransaction', [raw]);
  return { txHash: String(txHash) };
}

export async function waitForReceipt(chainId: number, txHash: string, timeoutMs = 90000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const receipt = await evmRpc(chainId, 'eth_getTransactionReceipt', [txHash]).catch(() => null);
    if (receipt && receipt.blockNumber) return receipt;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

export interface AggregatedSwapParams {
  chainId: number;
  srcToken: EvmToken;
  destToken: EvmToken;
  amountWei: string; // source amount in its native decimals
  userAddress: string;
  password?: string;
}

export interface AggregatedSwapResult {
  steps: string[];
  txHash?: string;
  destAmount?: string;
}

/** Full real swap: quote → (approve) → swap → return tx hash. */
export async function executeAggregatedSwap(p: AggregatedSwapParams): Promise<AggregatedSwapResult> {
  const network = p.chainId;
  const isNativeSrc = p.srcToken.address.toLowerCase() === ETH_SENTINEL.toLowerCase();

  const priceRoute = await getAggregatorQuote({
    srcToken: p.srcToken.address,
    destToken: p.destToken.address,
    amount: p.amountWei,
    srcDecimals: p.srcToken.decimals,
    destDecimals: p.destToken.decimals,
    network,
  });

  const destAmount = priceRoute.destAmount;
  const built = await buildAggregatorTx({
    srcToken: p.srcToken.address,
    destToken: p.destToken.address,
    srcAmount: p.amountWei,
    destAmount,
    userAddress: p.userAddress,
    priceRoute,
    srcDecimals: p.srcToken.decimals,
    destDecimals: p.destToken.decimals,
    network,
  });

  const steps: string[] = [];

  // ERC-20 → need approval first (native ETH needs none). ParaSwap's router
  // (built.to) is the allowance target.
  if (!isNativeSrc) {
    const spender = built.allowanceTarget || built.to;
    const allowance = await getAllowance(p.chainId, p.srcToken.address, p.userAddress, spender);
    if (allowance < ethers.getBigInt(p.amountWei)) {
      const appr = buildApprovalTx(p.srcToken.address, spender);
      const apprRes = await signAndSendTx(p.chainId, appr, p.password);
      steps.push('approve');
      await waitForReceipt(p.chainId, apprRes.txHash, 90000);
    }
  }

  const swapRes = await signAndSendTx(
    p.chainId,
    { to: built.to, data: built.data, value: built.value || '0x0' },
    p.password
  );
  steps.push('swap');

  return { steps, txHash: swapRes.txHash, destAmount };
}
