import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { deriveAllChainAddresses } from '../services/wallet/derive';
import { saveAddresses, savePrimaryAddress } from '../services/wallet/storage';
import AuthBackgroundVideo from '../components/AuthBackgroundVideo';

export default function LoginScreen({ navigation }: any) {
  const [secretInput, setSecretInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  const handleUnlockWithPhrase = async () => {
    const clean = secretInput.trim();
    if (!clean) return;

    const isMnemonic = bip39.validateMnemonic(clean.toLowerCase());
    const isPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(clean);

    if (!isMnemonic && !isPrivateKey) {
      Alert.alert(
        'Invalid Recovery Phrase',
        'Please enter a valid 12 or 24-word recovery phrase, or a 64-character private key.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const addresses: Record<string, string> = {};
      let secret = clean;

      if (isMnemonic) {
        secret = clean.toLowerCase();
        const chains = deriveAllChainAddresses(secret);
        for (const [id, c] of Object.entries(chains)) {
          if (c.address) addresses[id] = c.address;
        }
      } else {
        const pk = clean.startsWith('0x') ? clean : '0x' + clean;
        const wallet = new ethers.Wallet(pk);
        for (const id of ['eth', 'poly', 'bnb', 'opbnb', 'avax', 'mnt', 'plasma']) {
          addresses[id] = wallet.address;
        }
      }

      const primary = addresses.eth || '';
      await setMnemonic(secret);
      await saveAddresses(addresses);
      if (primary) await savePrimaryAddress(primary);

      setUserId(primary || null);
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } catch (err: any) {
      Alert.alert('Unlock Failed', 'Failed to derive keys: ' + (err?.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // APK Native Device Biometrics (Only on Mobile Native)
  const handleNativeBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Device Biometrics', 'No biometric record enrolled on this device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock CloudVoid Vault',
      });

      if (result.success) {
        // Unlock existing stored session if present
        const currentUserId = useWalletStore.getState().userId;
        if (currentUserId) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainFlow' }],
          });
        } else {
          Alert.alert('No Cached Wallet', 'Please enter your recovery phrase to restore your wallet.');
        }
      }
    } catch (e) {
      Alert.alert('Biometric Error', 'Authentication was cancelled.');
    }
  };

  return (
    <AuthBackgroundVideo overlayOpacity={isDesktop ? 0.55 : 0.65}>
      <ScrollView
        contentContainerStyle={[styles.container, isDesktop && styles.desktopContainer]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={16} color="#F8FAFC" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Obsidian Glass Monolith Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Image
              source={require('../../assets/cloudvoid_logo.png')}
              style={styles.cardLogo}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Access Your Wallet</Text>
              <Text style={styles.cardSubtitle}>100% decentralized. Self-custody keys only.</Text>
            </View>
          </View>

          {/* APK Native Biometrics Button (Mobile App Only) */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleNativeBiometrics}
              activeOpacity={0.85}
            >
              <Ionicons name="finger-print" size={22} color="#8B5CF6" style={{ marginRight: 10 }} />
              <Text style={styles.biometricBtnText}>Unlock with Device Biometrics</Text>
            </TouchableOpacity>
          )}

          {/* Recovery Phrase Inset Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>SECRET RECOVERY PHRASE OR PRIVATE KEY</Text>
            <View
              style={[
                styles.textAreaBox,
                isFocused && styles.textAreaBoxFocused,
                secretInput.trim().length > 0 && styles.textAreaBoxFilled,
              ]}
            >
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Paste your 12-word seed phrase or private key..."
                placeholderTextColor="#475569"
                value={secretInput}
                onChangeText={setSecretInput}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                secretInput.trim() && !isSubmitting ? styles.primaryBtnActive : styles.primaryBtnDisabled,
              ]}
              onPress={handleUnlockWithPhrase}
              disabled={!secretInput.trim() || isSubmitting}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  secretInput.trim() && !isSubmitting ? styles.primaryBtnTextActive : styles.primaryBtnTextDisabled,
                ]}
              >
                {isSubmitting ? 'Deriving Keys...' : 'Restore & Unlock Wallet'}
              </Text>
              {secretInput.trim() && !isSubmitting && (
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Optional Cloud Backup Link */}
          <View style={styles.cloudBackupRow}>
            <TouchableOpacity
              style={styles.cloudBtn}
              onPress={() => navigation.navigate('CloudBackup', { mode: 'import' })}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download-outline" size={16} color="#A78BFA" />
              <Text style={styles.cloudBtnText}>Restore from Google Cloud Backup</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Direct to Create */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerPrompt}>Don't have a wallet yet? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateWallet')}>
              <Text style={styles.footerHighlight}>Create New Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AuthBackgroundVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  desktopContainer: {
    maxWidth: 520,
    paddingTop: 40,
  },
  topBar: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  backText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(11, 15, 26, 0.88)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  cardLogo: {
    width: 44,
    height: 44,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.45)',
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 20,
  },
  biometricBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  textAreaBox: {
    backgroundColor: 'rgba(6, 8, 16, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 14,
    minHeight: 110,
    marginBottom: 16,
  },
  textAreaBoxFocused: {
    borderColor: '#8B5CF6',
  },
  textAreaBoxFilled: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  textArea: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
    height: '100%',
    textAlignVertical: 'top',
  },
  primaryBtn: {
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnActive: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryBtnTextActive: {
    color: '#FFFFFF',
  },
  primaryBtnTextDisabled: {
    color: '#475569',
  },
  cloudBackupRow: {
    alignItems: 'center',
    marginBottom: 18,
  },
  cloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  cloudBtnText: {
    fontSize: 12.5,
    color: '#A78BFA',
    fontWeight: '600',
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  footerPrompt: {
    fontSize: 13,
    color: '#94A3B8',
  },
  footerHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
});
