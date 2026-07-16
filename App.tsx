import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useWalletStore } from './src/stores/walletStore';
import { applyTheme } from './src/theme/tokens';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Inject Ionicons font face for web platform to prevent glitched square rendering
if (Platform.OS === 'web') {
  const iconFontStyles = `@font-face {
    font-family: 'Ionicons';
    src: url(${require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')}) format('truetype');
  }`;
  
  const style = document.createElement('style');
  style.type = 'text/css';
  if ((style as any).styleSheet) {
    (style as any).styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }
  document.head.appendChild(style);
}
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
