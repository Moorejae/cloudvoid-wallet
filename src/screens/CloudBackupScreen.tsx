import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import * as Haptics from 'expo-haptics';

export default function CloudBackupScreen({ route, navigation }: any) {
  const mode = route.params?.mode || 'import';
  const mnemonicToExport = route.params?.mnemonic || '';
  
  const [step, setStep] = useState<'account_selection' | 'processing' | 'file_selection'>('account_selection');
  const [selectedAccount, setSelectedAccount] = useState('');
  
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  const mockAccounts = [
    { email: 'satoshi.nakamoto@gmail.com', name: 'Satoshi Nakamoto' },
    { email: 'crypto.investor99@gmail.com', name: 'Crypto Investor' },
  ];

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account.email);
    setStep('processing');
    
    setTimeout(() => {
      if (mode === 'export') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Backup Successful', `Wallet backed up securely to ${account.email}'s Google Drive.`);
        navigation.navigate('SeedPhraseVerify', { mnemonic: mnemonicToExport });
      } else {
        setStep('file_selection');
      }
    }, 2000);
  };

  const handleFileSelect = async () => {
    setStep('processing');
    
    setTimeout(async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const mockPhrase = 'apple orange banana grape mango cherry lemon lime peach pear plum kiwi';
      const address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

      await setMnemonic(mockPhrase);
      setUserId(address);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch('http://localhost:3000/api/wallet/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, importMethod: 'google_drive' }),
          signal: controller.signal as any
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        if (data.tokens) {
          useWalletStore.getState().setTokens(data.tokens);
        }
      } catch (e) {
        console.warn('API sync failed or timed out', e);
      }
      
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.googleHeader}>
        <Text style={styles.googleLogo}>Google</Text>
        <Text style={styles.googleSubtitle}>Choose an account</Text>
        <Text style={styles.googleDesc}>
          to continue to <Text style={{fontWeight: '700'}}>CloudVoid Drive Sync</Text>
        </Text>
      </View>

      {step === 'account_selection' && (
        <ScrollView style={styles.accountList}>
          {mockAccounts.map((acc, i) => (
            <TouchableOpacity key={i} style={styles.accountCard} onPress={() => handleAccountSelect(acc)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{acc.name.charAt(0)}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.accountEmail}>{acc.email}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.accountCard}>
            <View style={[styles.avatar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]}>
              <Ionicons name="person-add-outline" size={20} color="#fff" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>Use another account</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 'processing' && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.processingText}>Connecting securely to Google Drive...</Text>
        </View>
      )}

      {step === 'file_selection' && (
        <View style={styles.fileSelectionContainer}>
          <Text style={styles.fileSelectionTitle}>Select Backup File</Text>
          <Text style={styles.fileSelectionSub}>Searching {selectedAccount} for CloudVoid backups</Text>
          
          <TouchableOpacity style={styles.fileCard} onPress={handleFileSelect}>
            <Ionicons name="document-text-outline" size={32} color="#4285F4" />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>CloudVoid_Backup_2026.txt</Text>
              <Text style={styles.fileMeta}>Modified: Today • 12 KB</Text>
            </View>
          </TouchableOpacity>
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
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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
  fileSelectionContainer: {
    flex: 1,
  },
  fileSelectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  fileSelectionSub: {
    fontSize: 14,
    color: '#9AA0A6',
    marginBottom: 24,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#303134',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3C4043',
  },
  fileInfo: {
    marginLeft: 16,
  },
  fileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileMeta: {
    color: '#9AA0A6',
    fontSize: 13,
  },
});
