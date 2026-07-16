import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '../services/web3Api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Ensure Google Sign-In is configured with the correct scopes and Client ID
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
    webClientId: '141857948281-547s5hcr7t0j3sbfepd23282fshd232a.apps.googleusercontent.com',
  });
}

export default function CloudBackupScreen({ route, navigation }: any) {
  const mode = route.params?.mode || 'import';
  const mnemonicToExport = route.params?.mnemonic || '';
  
  const [step, setStep] = useState<'account_selection' | 'processing' | 'file_selection'>('account_selection');
  
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  const [accessToken, setAccessToken] = useState('');
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Google Cloud backup is only supported on iOS and Android devices.');
      return;
    }
    setStep('processing');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      const user = userInfo.user || userInfo; // API shape might vary slightly by version
      
      setAccessToken(tokens.accessToken);
      setGoogleUser(user);
      
      if (mode === 'export') {
        uploadToDrive(tokens.accessToken, user);
      } else {
        listDriveFiles(tokens.accessToken);
      }
    } catch (error: any) {
      console.warn('Google Sign-In Error:', error);
      Alert.alert('Sign-In Error', error.message || 'Google Authentication failed or was cancelled.');
      setStep('account_selection');
    }
  };

  const uploadToDrive = async (token: string, user: any) => {
    try {
      const boundary = 'foo_bar_baz';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const metadata = {
        name: 'CloudVoid_Secret_Phrase.txt',
        mimeType: 'text/plain'
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/plain\r\n\r\n' +
        mnemonicToExport +
        close_delim;

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Backup Successful', `Wallet backed up securely to ${user.email || 'your account'}'s Google Drive.`);
        navigation.navigate('SeedPhraseVerify', { mnemonic: mnemonicToExport });
      } else {
        throw new Error('Upload failed with status ' + res.status);
      }
    } catch (e: any) {
      Alert.alert('Backup Error', 'Failed to save to Google Drive. Check connection or API permissions.');
      setStep('account_selection');
    }
  };

  const listDriveFiles = async (token: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/drive/v3/files?q=name contains 'CloudVoid'", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        setDriveFiles(data.files);
        setStep('file_selection');
      } else {
        Alert.alert('No Backups', 'No CloudVoid backups found in this Google Drive.');
        setStep('account_selection');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch files from Google Drive.');
      setStep('account_selection');
    }
  };

  const handleFileSelect = async (fileId: string) => {
    setStep('processing');
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const phrase = await res.text();
      
      if (!phrase || phrase.trim().split(/\s+/).length < 12) {
         throw new Error('Invalid backup file. Seed phrase not found.');
      }

      const mnemonic = phrase.trim();
      await setMnemonic(mnemonic);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${API_BASE_URL}/api/wallet/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic, importMethod: 'google_drive' }),
          signal: controller.signal as any
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        if (data.tokens) {
          useWalletStore.getState().setTokens(data.tokens);
        }
        if (data.userId) {
          setUserId(data.userId);
        }
      } catch (e) {
        console.warn('API sync failed or timed out', e);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } catch (e: any) {
      Alert.alert('Import Error', e.message || 'Failed to download and parse backup.');
      setStep('file_selection');
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
        <Text style={styles.googleLogo}>Google</Text>
        <Text style={styles.googleSubtitle}>CloudVoid Drive Sync</Text>
        <Text style={styles.googleDesc}>
          {mode === 'export' ? 'Backup your recovery phrase securely.' : 'Restore your wallet from Drive.'}
        </Text>
      </View>

      {step === 'account_selection' && (
        <ScrollView style={styles.accountList}>
          <TouchableOpacity 
            style={styles.accountCard} 
            onPress={handleGoogleSignIn}
          >
            <View style={[styles.avatar, { backgroundColor: '#4285F4' }]}>
               <Ionicons name="logo-google" size={20} color="#fff" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>Sign in with Google</Text>
              <Text style={styles.accountEmail}>Native Device Accounts</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 'processing' && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.processingText}>
            {googleUser ? `Syncing with ${googleUser.email || 'your account'}...` : 'Connecting securely to Google...'}
          </Text>
        </View>
      )}

      {step === 'file_selection' && (
        <View style={styles.fileSelectionContainer}>
          <Text style={styles.fileSelectionTitle}>Select Backup File</Text>
          <Text style={styles.fileSelectionSub}>Found in {googleUser?.email || 'your drive'}</Text>
          
          <ScrollView>
            {driveFiles.map((f, i) => (
              <TouchableOpacity key={i} style={styles.fileCard} onPress={() => handleFileSelect(f.id)}>
                <Ionicons name="document-text-outline" size={32} color="#4285F4" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{f.name}</Text>
                  <Text style={styles.fileMeta}>CloudVoid Secure Backup</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    marginBottom: 12,
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
