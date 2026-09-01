import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import * as Haptics from 'expo-haptics';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { deriveAllChainAddresses } from '../services/wallet/derive';
import { saveAddresses, savePrimaryAddress } from '../services/wallet/storage';
import VaultPasswordModal from '../components/VaultPasswordModal';
import AuthBackgroundVideo from '../components/AuthBackgroundVideo';
import { usePreventLeave } from '../hooks/usePreventLeave';

export default function ImportWalletScreen({ navigation, route }: any) {
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const pendingImportRef = useRef<{ input: string; isMnemonic: boolean } | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  usePreventLeave(navigation, mnemonicInput.trim().length > 0, {
    title: 'Discard import?',
    message: 'The recovery phrase you entered will be cleared if you leave.',
  });
  
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);
  const wallets = useWalletStore((state) => state.wallets);
  const isAddMode = route?.params?.mode === 'add' && wallets.length > 0;

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

  const finishImport = async (cleanInput: string, isMnemonic: boolean, password?: string) => {
    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const addresses: Record<string, string> = {};
      let secret = cleanInput;

      if (isMnemonic) {
        secret = cleanInput.toLowerCase();
        const chains = deriveAllChainAddresses(secret);
        for (const [id, c] of Object.entries(chains)) {
          if (c.address) addresses[id] = c.address;
        }
      } else {
        const pk = cleanInput.startsWith('0x') ? cleanInput : '0x' + cleanInput;
        const wallet = new ethers.Wallet(pk);
        for (const id of ['eth', 'poly', 'bnb', 'opbnb', 'avax', 'mnt', 'plasma']) {
          addresses[id] = wallet.address;
        }
      }

      const primary = addresses.eth || '';

      if (isAddMode) {
        // "Add New Wallet" — import into a new wallet without touching primary.
        const nextIndex = wallets.length + 1;
        await useWalletStore.getState().addExtraWallet(`Wallet ${nextIndex}`, secret, addresses, password);
        Alert.alert('Wallet Added', `Imported wallet added and now active.`);
        navigation.popToTop();
        return;
      }

      await setMnemonic(secret, password);
      await saveAddresses(addresses);
      if (primary) await savePrimaryAddress(primary);

      setUserId(primary || null);
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } catch (e: any) {
      Alert.alert('Import Error', 'Failed to derive wallet: ' + (e?.message || ''));
    } finally {
      setIsSubmitting(false);
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

    if (Platform.OS === 'web' && !vaultPassword) {
      pendingImportRef.current = { input: cleanInput, isMnemonic };
      setShowPasswordModal(true);
      return;
    }
    await finishImport(cleanInput, isMnemonic, Platform.OS === 'web' ? vaultPassword : undefined);
  };

  const handlePasswordConfirm = (password: string) => {
    setVaultPassword(password);
    setShowPasswordModal(false);
    const pending = pendingImportRef.current;
    if (pending) {
      finishImport(pending.input, pending.isMnemonic, password);
    }
  };

  return (
    <AuthBackgroundVideo overlayOpacity={isDesktop ? 0.55 : 0.65}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.container, isDesktop && styles.desktopContainer]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={18} color="#ffffff" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.glassCard}>
            <View style={styles.header}>
              <Text style={styles.badge}>RECOVERY PROTOCOL</Text>
              <Text style={styles.title}>Import Wallet</Text>
              <Text style={styles.subtitle}>
                Enter your 12, 18, or 24-word seed phrase or private key below to restore your assets.
              </Text>
            </View>

            <View style={styles.quickImportRow}>
              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={() => navigation.navigate('CloudBackup', { mode: 'import' })}
              >
                <Ionicons name="cloud-download-outline" size={16} color={CloudVoidTheme.colors.accent} />
                <Text style={styles.secondaryBtnText}>Google Cloud Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={handleFileImport}
              >
                <Ionicons name="document-text-outline" size={16} color="#ffffff" />
                <Text style={styles.secondaryBtnText}>Backup File (.txt)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Enter 12-word seed phrase or 0x private key..."
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={mnemonicInput}
                onChangeText={setMnemonicInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.primaryBtn, (!mnemonicInput.trim() || isSubmitting) && styles.primaryBtnDisabled]} 
                onPress={handleImport}
                disabled={!mnemonicInput.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryBtnText, (!mnemonicInput.trim() || isSubmitting) && styles.primaryBtnTextDisabled]}>
                  {isSubmitting ? 'Decrypting & Importing...' : 'Restore Sovereign Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <VaultPasswordModal
            visible={showPasswordModal}
            mode="set"
            onConfirm={handlePasswordConfirm}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackgroundVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  desktopContainer: {
    maxWidth: 560,
    paddingTop: 40,
  },
  topBar: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  glassCard: {
    backgroundColor: 'rgba(11, 16, 28, 0.84)',
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 2,
    color: CloudVoidTheme.colors.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 6,
    lineHeight: 20,
  },
  quickImportRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
    marginBottom: 22,
    minHeight: 130,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    height: '100%',
    textAlignVertical: 'top',
  },
  actionButtons: {
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOpacity: 0,
  },
  primaryBtnText: {
    color: '#060810',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  primaryBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
