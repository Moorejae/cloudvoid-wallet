import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
  setMnemonic: (phrase: string | null) => Promise<void>;
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
}

export const useWalletStore = create<WalletState>((set, get) => ({
  userId: null,
  email: null,
  trustPoints: 100,
  riskScore: 0,
  lockoutActive: false,
  mnemonic: null,
  isBiometricEnabled: false,
  isScreenshotBlocked: false,
  isVerified: false,
  activeWalletId: '',
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
  wallets: [],
  customRPCs: [],
  tokens: [
    { symbol: 'BTC', name: 'Bitcoin', price: 30121.75, change: 0.12, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [40, 45, 42, 50, 48, 55, 60] },
    { symbol: 'ETH', name: 'Ethereum', price: 121.73, change: -0.56, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [60, 55, 58, 45, 48, 40, 35] },
    { symbol: 'BNB', name: 'BNB', price: 38.88, change: -0.03, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', sparklineData: [45, 48, 42, 40, 38, 42, 38] },
    { symbol: 'XMR', name: 'Monero', price: 107.23, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [20, 25, 30, 40, 50, 55, 60] },
    { symbol: 'USDT', name: 'Tether', price: 100.00, change: -3.08, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 52, 48, 49, 45, 42, 40] },
  ],
  transactions: [],

  setUserId: (id) => set({ userId: id }),
  setEmail: (email) => set({ email }),
  setTrustPoints: (points) => set({ trustPoints: points }),
  setRiskScore: (score) => set({ riskScore: score }),
  setLockoutActive: (active) => set({ lockoutActive: active }),
  
  setMnemonic: async (phrase) => {
    if (phrase) {
      try { await SecureStore.setItemAsync('cloudvoid_mnemonic', phrase); } catch (e) {}
      set({ mnemonic: phrase });
    } else {
      try { await SecureStore.deleteItemAsync('cloudvoid_mnemonic'); } catch (e) {}
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

  removeToken: (symbol) => set((state) => ({
    tokens: state.tokens.filter((t) => t.symbol !== symbol)
  })),

  deleteWallet: (id) => set((state) => {
    const updatedWallets = state.wallets.filter((w) => w.id !== id);
    
    // If the active wallet is deleted, we also reset the balance/transactions
    // This connects it to the dashboard screen as requested
    if (id === '1' || updatedWallets.length === 0) {
      return {
        wallets: updatedWallets,
        balances: {
          BTC: 0, ETH: 0, BNB: 0, CELO: 0, USDT: 0, SOL: 0, TRX: 0, TON: 0, XMR: 0, MATIC: 0
        },
        transactions: []
      };
    }
    return { wallets: updatedWallets };
  }),
  
  resetForNewWallet: () => set({
    balances: {
      BTC: 0, ETH: 0, BNB: 0, CELO: 0, USDT: 0, SOL: 0, TRX: 0, TON: 0, XMR: 0, MATIC: 0
    },
    transactions: []
  }),
  
  wipeWallet: async () => {
    try { await SecureStore.deleteItemAsync('cloudvoid_mnemonic'); } catch (e) {}
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
        { symbol: 'BTC', name: 'Bitcoin', price: 30121.75, change: 0.12, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [40, 45, 42, 50, 48, 55, 60] },
        { symbol: 'ETH', name: 'Ethereum', price: 121.73, change: -0.56, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [60, 55, 58, 45, 48, 40, 35] },
        { symbol: 'BNB', name: 'BNB', price: 38.88, change: -0.03, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', sparklineData: [45, 48, 42, 40, 38, 42, 38] },
        { symbol: 'XMR', name: 'Monero', price: 107.23, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [20, 25, 30, 40, 50, 55, 60] },
        { symbol: 'USDT', name: 'Tether', price: 100.00, change: -3.08, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 52, 48, 49, 45, 42, 40] },
      ],
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

    let newBalances = {};
    if (id === '1') {
      newBalances = { BTC: 0.452, ETH: 2.15, BNB: 4.8, CELO: 150.0, USDT: 500.0, SOL: 12.5, TRX: 850.0, TON: 35.0, XMR: 1.2, MATIC: 450.0 };
    } else if (id === '2') {
      newBalances = { BTC: 0.12, ETH: 0.85, BNB: 1.2, CELO: 45.0, USDT: 120.0, SOL: 3.4, TRX: 210.0, TON: 8.0, XMR: 0.2, MATIC: 95.0 };
    } else if (id === '3') {
      newBalances = { BTC: 0.05, ETH: 0.32, BNB: 0.5, CELO: 10.0, USDT: 50.0, SOL: 1.2, TRX: 80.0, TON: 2.0, XMR: 0.05, MATIC: 30.0 };
    } else {
      newBalances = { BTC: 0.005, ETH: 0.02, BNB: 0.1, CELO: 2.0, USDT: 10.0, SOL: 0.2, TRX: 50.0, TON: 0.5, XMR: 0.01, MATIC: 10.0 };
    }

    set({ activeWalletId: id, balances: newBalances });
  }
}));
