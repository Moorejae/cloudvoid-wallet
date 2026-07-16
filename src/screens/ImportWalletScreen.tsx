import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '../services/web3Api';
import Svg, { Path } from 'react-native-svg';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const GoogleDriveIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 87.3 78">
    <Path d="M60.6 22.8l26.7 46.2H34L60.6 22.8z" fill="#FFC107"/>
    <Path d="M26.7 77.8L0 31.5h53.3l-26.6 46.3z" fill="#00A769"/>
    <Path d="M60.6 22.8L34 69H7.3l26.7-46.2h26.6z" fill="#0066DA"/>
  </Svg>
);

export default function ImportWalletScreen({ navigation }: any) {
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  const handleFileImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      const wordsMatches = fileContent.match(/[a-zA-Z]+/g);
      if (wordsMatches) {
        const cleanWords = wordsMatches.map(w => w.toLowerCase());
        let foundMnemonic = false;
        
        // Scan for 12-word BIP39 mnemonic
        for (let i = 0; i <= cleanWords.length - 12; i++) {
          const slice12 = cleanWords.slice(i, i + 12).join(' ');
          if (bip39.validateMnemonic(slice12)) {
            setMnemonicInput(slice12);
            Alert.alert('Imported from File', 'Valid 12-word seed phrase parsed and loaded successfully.');
            foundMnemonic = true;
            break;
          }
        }
        
        // Scan for 24-word BIP39 mnemonic if 12 not found
        if (!foundMnemonic) {
          for (let i = 0; i <= cleanWords.length - 24; i++) {
            const slice24 = cleanWords.slice(i, i + 24).join(' ');
            if (bip39.validateMnemonic(slice24)) {
              setMnemonicInput(slice24);
              Alert.alert('Imported from File', 'Valid 24-word seed phrase parsed and loaded successfully.');
              foundMnemonic = true;
              break;
            }
          }
        }

        if (!foundMnemonic) {
          // Check for private key
          const rawClean = fileContent.trim().replace(/^0x/i, '');
          if (/^[0-9a-fA-F]{64}$/.test(rawClean)) {
            setMnemonicInput(rawClean);
            Alert.alert('Imported from File', 'Private key parsed and loaded successfully.');
          } else {
            // Fallback
            const joined = cleanWords.join(' ');
            setMnemonicInput(joined);
            Alert.alert('File Loaded', 'Text file loaded. Please review and edit the seed phrase.');
          }
        }
      } else {
        Alert.alert('Empty File', 'The selected file does not contain any text.');
      }
    } catch (err: any) {
      Alert.alert('File Error', 'Failed to read or parse file: ' + err.message);
    }
  };

  const handleImport = async () => {
    const cleanInput = mnemonicInput.trim();
    const isMnemonic = bip39.validateMnemonic(cleanInput.toLowerCase());
    const isPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(cleanInput);

    if (!isMnemonic && !isPrivateKey) {
      Alert.alert('Invalid Import Data', 'The entered text is not a valid 12, 18, or 24-word seed phrase, or a 64-character private key.');
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      let address = '';
      if (isMnemonic) {
        await setMnemonic(cleanInput.toLowerCase());
        const wallet = ethers.Wallet.fromPhrase(cleanInput.toLowerCase());
        address = wallet.address;
      } else {
        const pk = cleanInput.startsWith('0x') ? cleanInput : '0x' + cleanInput;
        await setMnemonic(pk); // temporarily reuse mnemonic store for private key storage
        const wallet = new ethers.Wallet(pk);
        address = wallet.address;
      }

      setUserId(address);
      useWalletStore.getState().resetForNewWallet();
      
      // Register with backend with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${API_BASE_URL}/api/wallet/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, importMethod: isMnemonic ? 'mnemonic_import' : 'private_key_import' }),
          signal: controller.signal as any
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        if (data.tokens) {
          useWalletStore.getState().setTokens(data.tokens);
        }
      } catch (apiError) {
        console.warn('API Registration failed or timed out, proceeding anyway:', apiError);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } catch (e: any) {
      Alert.alert('Import Error', 'Failed to derive wallet: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Import Wallet</Text>
            <Text style={styles.subtitle}>
              Enter your 12, 18, or 24-word seed phrase or private key below to restore your wallet.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { marginBottom: 12 }]} 
            onPress={() => navigation.navigate('CloudBackup', { mode: 'import' })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GoogleDriveIcon size={18} />
              <Text style={styles.secondaryBtnText}>Import from Google Drive</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { marginBottom: 24 }]} 
            onPress={handleFileImport}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="document-text-outline" size={18} color={CloudVoidTheme.colors.textPrimary} />
              <Text style={styles.secondaryBtnText}>Import from Backup File</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Enter your seed phrase or private key here..."
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              value={mnemonicInput}
              onChangeText={setMnemonicInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.primaryBtn, (!mnemonicInput.trim() || isSubmitting) && styles.primaryBtnDisabled]} 
              onPress={handleImport}
              disabled={!mnemonicInput.trim() || isSubmitting}
            >
              <Text style={[styles.primaryBtnText, (!mnemonicInput.trim() || isSubmitting) && styles.primaryBtnTextDisabled]}>
                {isSubmitting ? 'Importing...' : 'Import Wallet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000000',
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  topBar: {
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textSubHeader,
  },
  inputContainer: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    minHeight: 120,
    padding: 16,
    marginBottom: 24,
  },
  textInput: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  bottomSection: {
    marginTop: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  secondaryBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  secondaryBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnDisabled: {
    backgroundColor: '#2a2a2a',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnTextDisabled: {
    color: CloudVoidTheme.colors.textSecondary,
  },
});
