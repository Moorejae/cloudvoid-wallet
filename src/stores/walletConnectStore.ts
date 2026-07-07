import { create } from 'zustand';

export interface WalletConnectSession {
  topic: string;
  peerMeta: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  connectedAt: number;
}

interface WalletConnectState {
  isInitializing: boolean;
  sessions: WalletConnectSession[];
  initWalletConnect: () => Promise<void>;
  pair: (uri: string) => Promise<boolean>;
  disconnectSession: (topic: string) => Promise<void>;
}

export const useWalletConnectStore = create<WalletConnectState>((set, get) => ({
  isInitializing: false,
  sessions: [],
  
  // Foundation for @walletconnect/web3wallet SDK initialization
  initWalletConnect: async () => {
    set({ isInitializing: true });
    try {
      /*
        TODO (Production):
        1. Initialize Core from @walletconnect/core
        const core = new Core({ projectId: '01a0bfc09d630be79607f2a522b32bc6' })
        
        2. Initialize Web3Wallet
        const web3wallet = await Web3Wallet.init({
          core,
          metadata: {
            name: 'CloudVoid',
            description: 'CloudVoid Web3 Wallet',
            url: 'https://cloudvoid.app',
            icons: ['https://cloudvoid.app/icon.png']
          }
        })

        3. Set up event listeners
        web3wallet.on('session_proposal', onSessionProposal)
        web3wallet.on('session_request', onSessionRequest)
        web3wallet.on('session_delete', onSessionDelete)
      */
      console.log('WalletConnect SDK initialized');
    } finally {
      set({ isInitializing: false });
    }
  },

  // Foundation for parsing a WalletConnect URI (wc:...)
  pair: async (uri: string) => {
    if (!uri.startsWith('wc:')) {
      return false;
    }
    
    /*
      TODO (Production):
      await core.pairing.pair({ uri })
      // This will trigger 'session_proposal' event
    */
    
    // MOCK: Simulate an incoming connection for testing purposes
    const mockSession: WalletConnectSession = {
      topic: Math.random().toString(36).substring(7),
      peerMeta: {
        name: 'Mock Web3 dApp',
        description: 'A mock decentralized application',
        url: 'https://mockdapp.io',
        icons: ['https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.png'],
      },
      connectedAt: Date.now(),
    };

    set((state) => ({ sessions: [...state.sessions, mockSession] }));
    return true;
  },

  disconnectSession: async (topic: string) => {
    /*
      TODO (Production):
      await web3wallet.disconnectSession({
        topic,
        reason: getSdkError('USER_DISCONNECTED')
      })
    */
    set((state) => ({
      sessions: state.sessions.filter(s => s.topic !== topic)
    }));
  }
}));
