import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useWalletStore } from './src/stores/walletStore';
import { applyTheme } from './src/theme/tokens';

export default function App() {
  const theme = useWalletStore((state: any) => state.theme) || 'dark';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <>
      <AppNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
