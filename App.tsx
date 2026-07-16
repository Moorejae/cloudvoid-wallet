import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useWalletStore } from './src/stores/walletStore';
import { applyTheme } from './src/theme/tokens';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Inject vector icons font face for web platform to prevent glitched square rendering
if (Platform.OS === 'web') {
  const iconFontStyles = `
    @font-face {
      font-family: 'Ionicons';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
    }
    @font-face {
      font-family: 'MaterialCommunityIcons';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Feather';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
    }
    @font-face {
      font-family: 'FontAwesome';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf') format('truetype');
    }
    @font-face {
      font-family: 'FontAwesome5_Regular';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf') format('truetype');
    }
    @font-face {
      font-family: 'FontAwesome5_Solid';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf') format('truetype');
    }
    @font-face {
      font-family: 'AntDesign';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Entypo';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf') format('truetype');
    }
    @font-face {
      font-family: 'EvilIcons';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/EvilIcons.ttf') format('truetype');
    }
    @font-face {
      font-family: 'SimpleLineIcons';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/SimpleLineIcons.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Octicons';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Octicons.ttf') format('truetype');
    }
    @font-face {
      font-family: 'MaterialIcons';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Foundation';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Foundation.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Fontisto';
      src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Fontisto.ttf') format('truetype');
    }
  `;
  
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
