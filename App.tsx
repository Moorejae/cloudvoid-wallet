import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useWalletStore } from './src/stores/walletStore';
import { applyTheme } from './src/theme/tokens';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const theme = useWalletStore((state: any) => state.theme) || 'dark';
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

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
