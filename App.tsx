import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useWalletStore } from './src/stores/walletStore';
import { applyTheme } from './src/theme/tokens';

export default function App() {
  const theme = useWalletStore((state: any) => state.theme) || 'dark';

  useEffect(() => {
    applyTheme(theme);
    // Restore additional wallets persisted in SecureStore (native) on launch.
    useWalletStore.getState().hydrateWallets().catch(() => {});
  }, [theme]);

  return (
    <>
      <AppNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
