import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { saveMnemonic, deleteMnemonic, getPersistedPrimaryAddress, getPersistedAddresses, saveWalletList, getPersistedWalletList, loadWalletList, saveExtraWallet, deleteExtraWallet, clearAllExtraWallets, WalletListEntry } from '../services/wallet/storage';

export interface Transaction {
  id: string;
  type: 'Send' | 'Receive' | 'Swap' | 'P2P' | 'Buy';
  token: string;
  amount: number;
  fiatAmount: number;
  status: 'Confirmed' | 'Pending' | 'Failed';
  counterparty: string;
  timestamp: string;
  dateGroup?: string;
}

export interface CustomRPC {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: string;
  symbol: string;
  explorerUrl?: string;
  latency?: number;
}

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  status: string;
}

export interface TokenItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  iconUrl: string;
  sparklineData: number[];
}

interface WalletState {
  userId: string | null;
  email: string | null;
  trustPoints: number;
  riskScore: number;
  lockoutActive: boolean;
  mnemonic: string | null;
  isBiometricEnabled: boolean;
  isScreenshotBlocked: boolean;
  isVerified: boolean;
  selectedCurrency: string;
  selectedLanguage: string;
  theme: 'dark' | 'light';
  balances: Record<string, number>;
  transactions: Transaction[];
  customRPCs: CustomRPC[];
  tokens: TokenItem[];
  wallets: WalletAccount[];
  activeWalletId: string;
  setActiveWalletId: (id: string) => void;
  
  // AI Assistant and filtering integration states
  notificationsEnabled: boolean;
  activeTxFilter: 'All' | 'Receive' | 'Send' | 'Market';
  activeTxDateFilter: string | null;
  activeTxHashQuery: string | null;
  
  setUserId: (id: string | null) => void;
  setEmail: (email: string | null) => void;
  setTrustPoints: (points: number) => void;
  setRiskScore: (score: number) => void;
  setLockoutActive: (active: boolean) => void;
  setMnemonic: (phrase: string | null, password?: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => void;
  setScreenshotBlocked: (blocked: boolean) => void;
  setIsVerified: (verified: boolean) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setBalances: (balances: Record<string, number>) => void;
  addTransaction: (tx: Transaction) => void;
  addCustomRPC: (rpc: CustomRPC) => void;
  addToken: (token: TokenItem) => void;
  setTokens: (tokens: TokenItem[]) => void;
  removeToken: (symbol: string) => void;
  deleteWallet: (id: string) => void;
  resetForNewWallet: () => void;
  wipeWallet: () => Promise<void>;
  
  // AI Assistant actions
  setNotificationsEnabled: (enabled: boolean) => void;
  setActiveTxFilter: (filter: 'All' | 'Receive' | 'Send' | 'Market') => void;
  setActiveTxDateFilter: (date: string | null) => void;
  setActiveTxHashQuery: (hash: string | null) => void;
  addWallet: (wallet: WalletAccount) => void;
  addExtraWallet: (name: string, mnemonic: string, addresses: Record<string, string>, password?: string) => Promise<void>;
  hydrateWallets: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  userId: getPersistedPrimaryAddress(),
  email: 'developer@cloudvoid.online',
  trustPoints: 100,
  riskScore: 0,
  lockoutActive: false,
  mnemonic: null,
  isBiometricEnabled: false,
  isScreenshotBlocked: false,
  isVerified: true,
  activeWalletId: '1',
  notificationsEnabled: true,
  activeTxFilter: 'All',
  activeTxDateFilter: null,
  activeTxHashQuery: null,
  selectedCurrency: (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('cloudvoid_currency')) || 'USD',
  selectedLanguage: (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('cloudvoid_language')) || 'English',
  theme: (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('cloudvoid_theme') as 'dark' | 'light') || 'dark',
  balances: {
    BTC: 0,
    ETH: 0,
    BNB: 0,
    CELO: 0,
    USDT: 0,
    SOL: 0,
    TRX: 0,
    TON: 0,
    XMR: 0,
    MATIC: 0,
  },
  wallets: (() => {
    const addrs = getPersistedAddresses();
    const primary: WalletAccount[] = addrs && addrs.eth
      ? [{ id: '1', name: 'Main Wallet', address: addrs.eth, status: 'Active' }]
      : [];
    const list = getPersistedWalletList() || [];
    const merged = [...primary];
    for (const w of list) {
      if (!merged.some((m) => m.id === w.id)) {
        merged.push({ id: w.id, name: w.name, address: w.address, status: w.status });
      }
    }
    return merged;
  })(),
  customRPCs: [],
  tokens: [
    { symbol: 'BTC', name: 'Bitcoin', price: 64210.50, change: 1.25, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [48, 52, 51, 56, 60, 63, 68] },
    { symbol: 'ETH', name: 'Ethereum', price: 3485.20, change: -0.52, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [58, 61, 60, 66, 69, 71, 74] },
    { symbol: 'SOL', name: 'Solana', price: 145.80, change: 4.12, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png', sparklineData: [38, 42, 45, 44, 47, 52, 58] },
    { symbol: 'XMR', name: 'Monero', price: 167.00, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [32, 36, 39, 42, 40, 44, 48] },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.02, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 50, 50, 50, 50, 51, 51] },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.1542, change: 5.23, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/dogecoin/info/logo.png', sparklineData: [40, 42, 44, 45, 47, 48, 50] },
  ],
  transactions: [],

  setUserId: (id) => set({ userId: id }),
  setEmail: (email) => set({ email }),
  setTrustPoints: (points) => set({ trustPoints: points }),
  setRiskScore: (score) => set({ riskScore: score }),
  setLockoutActive: (active) => set({ lockoutActive: active }),
  
  setMnemonic: async (phrase, password) => {
    if (phrase) {
      // Web requires the vault password (PBKDF2 + AES-GCM); native uses SecureStore.
      await saveMnemonic(phrase, password);
      set({ mnemonic: phrase });
    } else {
      await deleteMnemonic();
      set({ mnemonic: null });
    }
  },
  
  setBiometricEnabled: (enabled) => set({ isBiometricEnabled: enabled }),
  setScreenshotBlocked: (blocked) => set({ isScreenshotBlocked: blocked }),
  setIsVerified: (verified) => set({ isVerified: verified }),
  setCurrency: (currency) => {
    set({ selectedCurrency: currency });
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('cloudvoid_currency', currency);
    }
  },
  setLanguage: (lang) => {
    set({ selectedLanguage: lang });
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('cloudvoid_language', lang);
    }
  },
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('cloudvoid_theme', theme);
    }
  },
  
  setBalances: (newBalances) => set((state) => ({
    balances: { ...state.balances, ...newBalances }
  })),
  
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions]
  })),
  
  addCustomRPC: (rpc) => set((state) => ({
    customRPCs: [...state.customRPCs, rpc]
  })),
  
  addToken: (token) => set((state) => ({
    tokens: [...state.tokens, token]
  })),

  setTokens: (tokens) => set({ tokens }),

  removeToken: (symbol) => set((state) => ({
    tokens: state.tokens.filter((t) => t.symbol !== symbol)
  })),

  deleteWallet: (id) => {
    const state = get();
    const updatedWallets = state.wallets.filter((w) => w.id !== id);

    // Extra wallets carry their own seed record — remove it (never touches the
    // primary seed). Then persist the updated wallet list.
    if (id !== '1') {
      deleteExtraWallet(id).catch(() => {});
    }
    saveWalletList(updatedWallets).catch(() => {});

    // If the active wallet is deleted, we also reset the balance/transactions
    // This connects it to the dashboard screen as requested
    if (id === '1' || updatedWallets.length === 0) {
      set({
        wallets: updatedWallets,
        balances: {
          BTC: 0, ETH: 0, BNB: 0, CELO: 0, USDT: 0, SOL: 0, TRX: 0, TON: 0, XMR: 0, MATIC: 0
        },
        transactions: []
      });
    } else {
      set({ wallets: updatedWallets });
    }
  },
  
  resetForNewWallet: () => set({
    balances: {
      BTC: 0, ETH: 0, BNB: 0, CELO: 0, USDT: 0, SOL: 0, TRX: 0, TON: 0, XMR: 0, MATIC: 0
    },
    transactions: []
  }),
  
  wipeWallet: async () => {
    await deleteMnemonic();
    await clearAllExtraWallets();
    await saveWalletList([]);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('cloudvoid_addresses');
      window.localStorage.removeItem('cloudvoid_userId');
    }
    set({
      userId: null,
      email: null,
      trustPoints: 100,
      riskScore: 0,
      lockoutActive: false,
      mnemonic: null,
      balances: {
        BTC: 0,
        ETH: 0,
        BNB: 0,
        CELO: 0,
        USDT: 0,
        SOL: 0,
        TRX: 0,
        TON: 0,
        XMR: 0,
        MATIC: 0,
      },
      transactions: [],
      customRPCs: [],
      tokens: [
        { symbol: 'BTC', name: 'Bitcoin', price: 64210.50, change: 1.25, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [48, 52, 51, 56, 60, 63, 68] },
        { symbol: 'ETH', name: 'Ethereum', price: 3485.20, change: -0.52, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [58, 61, 60, 66, 69, 71, 74] },
        { symbol: 'SOL', name: 'Solana', price: 145.80, change: 4.12, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png', sparklineData: [38, 42, 45, 44, 47, 52, 58] },
        { symbol: 'XMR', name: 'Monero', price: 167.00, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [32, 36, 39, 42, 40, 44, 48] },
        { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.02, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 50, 50, 50, 50, 51, 51] },
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.1542, change: 5.23, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/dogecoin/info/logo.png', sparklineData: [40, 42, 44, 45, 47, 48, 50] },
      ],
      wallets: [],
      theme: 'dark',
    });
  },

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setActiveTxFilter: (filter) => set({ activeTxFilter: filter }),
  setActiveTxDateFilter: (date) => set({ activeTxDateFilter: date }),
  setActiveTxHashQuery: (hash) => set({ activeTxHashQuery: hash }),
  addWallet: (wallet) => set((state) => ({ wallets: [...state.wallets, wallet] })),
  setActiveWalletId: (id) => {
    const wallets = get().wallets;
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) return;

    // In a real app we would load balances from the actual wallet address.
    // Since we are removing mock data, we just initialize to 0.
    const newBalances = { BTC: 0, ETH: 0, BNB: 0, CELO: 0, USDT: 0, SOL: 0, TRX: 0, TON: 0, XMR: 0, MATIC: 0 };
    set({ activeWalletId: id, balances: newBalances });
  },

  // "Add New Wallet" — creates an additional, independent wallet with its own
  // seed. It is added to the wallet list and made active WITHOUT overwriting
  // the primary wallet's seed or resetting the session.
  addExtraWallet: async (name, mnemonic, addresses, password) => {
    const state = get();
    const nextId = `w${state.wallets.length + 1}`;
    const primaryEth = addresses.eth || '';
    await saveExtraWallet({ id: nextId, name, mnemonic, addresses, primaryEth }, password);
    const entry: WalletAccount = { id: nextId, name, address: primaryEth, status: 'Active' };
    const nextWallets = [...state.wallets, entry];
    await saveWalletList(nextWallets);
    set({ wallets: nextWallets, activeWalletId: nextId });
  },

  // Restores additional wallets persisted in SecureStore on native builds.
  hydrateWallets: async () => {
    const list = await loadWalletList();
    if (!list || list.length === 0) return;
    const state = get();
    const merged = [...state.wallets];
    for (const w of list) {
      if (!merged.some((m) => m.id === w.id)) {
        merged.push({ id: w.id, name: w.name, address: w.address, status: w.status });
      }
    }
    set({ wallets: merged });
  },
}));
