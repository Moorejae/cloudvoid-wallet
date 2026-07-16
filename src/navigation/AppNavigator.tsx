import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Theme Tokens & Global State
import { CloudVoidTheme, applyTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';

// Import Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import ImportWalletScreen from '../screens/ImportWalletScreen';
import CreateWalletScreen from '../screens/CreateWalletScreen';
import SeedPhraseVerifyScreen from '../screens/SeedPhraseVerifyScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TokenDetailScreen from '../screens/TokenDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TwoFASetupScreen from '../screens/TwoFASetupScreen';
import AddCustomRPCScreen from '../screens/AddCustomRPCScreen';
import LocalLatencyPingsScreen from '../screens/LocalLatencyPingsScreen';
import ManageWalletsScreen from '../screens/ManageWalletsScreen';
import CurrencySelectionScreen from '../screens/CurrencySelectionScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import ThemeModeScreen from '../screens/ThemeModeScreen';
import TransactionReceiptScreen from '../screens/TransactionReceiptScreen';
import Web3PortalScreen from '../screens/Web3PortalScreen';
import TerminateAccountScreen from '../screens/TerminateAccountScreen';
import LegalDocumentScreen from '../screens/LegalDocumentScreen';

// Modal Group Screens
import SendScreen from '../screens/SendScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import SwapScreen from '../screens/SwapScreen';
import CloudBackupScreen from '../screens/CloudBackupScreen';
import ConnectHardwareWalletScreen from '../screens/ConnectHardwareWalletScreen';
import MoneroViewerScreen from '../screens/MoneroViewerScreen';

// Web3 Flow Screens
import DAppsScreen from '../screens/DAppsScreen';
import DAppDetailScreen from '../screens/DAppDetailScreen';
import CryptoTradingScreen from '../screens/CryptoTradingScreen';
import SwapConfirmationScreen from '../screens/SwapConfirmationScreen';
import WalletConnectScannerScreen from '../screens/WalletConnectScannerScreen';
import QRModalScreen from '../screens/QRModalScreen';

// Import Floating AI assistant
import AIBrain from '../components/AIBrain';

function ThemeManager() {
  const theme = useWalletStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}

function LanguageManager() {
  const selectedLanguage = useWalletStore((state) => state.selectedLanguage);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const languageMap: Record<string, string> = {
      'English': 'en',
      'Igbo': 'ig',
      'Yoruba': 'yo',
      'Hausa': 'ha',
      'French': 'fr',
      'Spanish': 'es',
      'German': 'de',
      'Chinese': 'zh-CN',
      'Arabic': 'ar',
      'Russian': 'ru',
    };

    const targetLang = languageMap[selectedLanguage] || 'en';
    
    // Helper to set cookie
    const setCookie = (name: string, value: string, days?: number) => {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "")  + expires + "; path=/";
      document.cookie = name + "=" + (value || "")  + expires + "; path=/; domain=" + window.location.hostname;
    };

    // Helper to erase cookie
    const eraseCookie = (name: string) => {   
      document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = name +'=; Path=/; Domain=' + window.location.hostname + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    // Get current googtrans value
    const getCookie = (name: string) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    };

    const currentTrans = getCookie('googtrans');
    const expectedTrans = targetLang === 'en' ? null : `/en/${targetLang}`;

    if (targetLang !== 'en') {
      // Inject Google Translate script if not present
      if (!document.getElementById('google-translate-script')) {
        const translateContainer = document.createElement('div');
        translateContainer.id = 'google_translate_element';
        translateContainer.style.display = 'none';
        document.body.appendChild(translateContainer);

        const initScript = document.createElement('script');
        initScript.innerHTML = `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        `;
        document.head.appendChild(initScript);

        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
      }

      // Inject custom CSS to hide Google Translate banner, branding and tooltips
      if (!document.getElementById('google-translate-styles')) {
        const style = document.createElement('style');
        style.id = 'google-translate-styles';
        style.innerHTML = `
          body {
            top: 0px !important;
          }
          .goog-te-banner-frame, 
          .goog-te-banner-frame.skiptranslate,
          [id*="goog-gt-"], 
          #goog-gt-tt, 
          .goog-te-balloon-frame,
          .goog-tooltip,
          .goog-tooltip:hover {
            display: none !important;
            visibility: hidden !important;
          }
          .goog-text-highlight {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          #google_translate_element {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    if (currentTrans !== expectedTrans) {
      if (expectedTrans) {
        setCookie('googtrans', expectedTrans, 1);
      } else {
        eraseCookie('googtrans');
      }
      
      // Reload page to apply google translate cookie
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  }, [selectedLanguage]);

  return null;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="SeedPhraseVerify" component={SeedPhraseVerifyScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 24,
          backgroundColor: CloudVoidTheme.colors.surface,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          elevation: 5,
        },
        tabBarActiveTintColor: CloudVoidTheme.colors.success,
        tabBarInactiveTintColor: CloudVoidTheme.colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Wallet"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Web3"
        component={Web3PortalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const userId = useWalletStore((state) => state.userId);
  const [currentRoute, setCurrentRoute] = useState('Wallet');

  const blockedRoutes = [
    'TerminateAccount', 'DAppDetail', 'SwapConfirmation', 'WalletConnectScanner'
  ];
  const showAI = userId && !blockedRoutes.includes(currentRoute);

  return (
    <NavigationContainer
      onStateChange={(state) => {
        if (!state) return;
        let current = state as any;
        while (current.routes[current.index]?.state) {
          current = current.routes[current.index].state;
        }
        setCurrentRoute(current.routes[current.index]?.name || 'Wallet');
      }}
    >
      <View style={{ flex: 1, backgroundColor: 'var(--bg)' }}>
        <ThemeManager />
        <LanguageManager />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!userId ? (
            <Stack.Screen name="AuthFlow" component={AuthStack} />
          ) : (
            <Stack.Screen name="MainFlow" component={MainTabNavigator} />
          )}
          
          {/* Modal overlay groups */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="TerminateAccount" component={TerminateAccountScreen} />
            <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
            <Stack.Screen name="TransactionReceipt" component={TransactionReceiptScreen} />
            <Stack.Screen name="TokenDetail" component={TokenDetailScreen} />
            <Stack.Screen name="Send" component={SendScreen} />
            <Stack.Screen name="Receive" component={ReceiveScreen} />
            <Stack.Screen name="Swap" component={SwapScreen} />
            <Stack.Screen name="QRModal" component={QRModalScreen} />
            <Stack.Screen name="WalletConnectScanner" component={WalletConnectScannerScreen} />
            <Stack.Screen name="DApps" component={DAppsScreen} />
            <Stack.Screen name="CryptoTrading" component={CryptoTradingScreen} />
            <Stack.Screen name="DAppDetail" component={DAppDetailScreen} />
            <Stack.Screen name="SwapConfirmation" component={SwapConfirmationScreen} />
            <Stack.Screen name="TwoFASetup" component={TwoFASetupScreen} />
            <Stack.Screen name="AddCustomRPC" component={AddCustomRPCScreen} />
            <Stack.Screen name="LocalLatencyPings" component={LocalLatencyPingsScreen} />
            <Stack.Screen name="ManageWallets" component={ManageWalletsScreen} />
            <Stack.Screen name="MoneroViewer" component={MoneroViewerScreen} />
            <Stack.Screen name="CurrencySelection" component={CurrencySelectionScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="ThemeMode" component={ThemeModeScreen} />
            
            {/* Wallet Import/Create screens moved here for easy access while auth is bypassed */}
            <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
            <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
            <Stack.Screen name="SeedPhraseVerify" component={SeedPhraseVerifyScreen} />
            <Stack.Screen name="CloudBackup" component={CloudBackupScreen} />
            <Stack.Screen name="ConnectHardwareWallet" component={ConnectHardwareWalletScreen} />
          </Stack.Group>
        </Stack.Navigator>

        {/* Floating AI assistant bubble when user is authenticated */}
        {showAI && <AIBrain currentRouteName={currentRoute} />}
      </View>
    </NavigationContainer>
  );
}
