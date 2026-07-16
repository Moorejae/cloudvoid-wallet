import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, AppState, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useFocusEffect } from '@react-navigation/native';
import { ethers } from 'ethers';
import 'react-native-get-random-values';
import * as Clipboard from 'expo-clipboard';
import * as ScreenCapture from 'expo-screen-capture';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function CreateWalletScreen({ navigation }: any) {
  const [mnemonic, setMnemonic] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [clipboardTimer, setClipboardTimer] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      // Regenerate mnemonic securely every time screen comes into focus.
      // Ensure all 12 words are completely unique to prevent user confusion.
      let wallet;
      let phraseArray;
      do {
        wallet = ethers.Wallet.createRandom();
        phraseArray = wallet.mnemonic?.phrase.split(' ') || [];
      } while (new Set(phraseArray).size !== 12);

      if (wallet.mnemonic) {
        setMnemonic(wallet.mnemonic.phrase);
      }
      setIsBlurred(false);

      // Prevent screenshot / screen recording on native
      if (Platform.OS !== 'web') {
        try {
          ScreenCapture.preventScreenCaptureAsync();
        } catch (e) {}
      }

    // Blur seed phrase or wipe it when app is backgrounded
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsBlurred(true);
        // Regenerate on background to prevent returning to the same phrase.
        // Ensure strictly 12 unique words.
        let newWallet;
        let phraseArray;
        do {
          newWallet = ethers.Wallet.createRandom();
          phraseArray = newWallet.mnemonic?.phrase.split(' ') || [];
        } while (new Set(phraseArray).size !== 12);

        if (newWallet.mnemonic) {
          setMnemonic(newWallet.mnemonic.phrase);
        }
      }
    });

    return () => {
      if (Platform.OS !== 'web') {
        try {
          ScreenCapture.allowScreenCaptureAsync();
        } catch (e) {}
      }
      subscription.remove();
    };
  }, [])
  );

  // Countdown timer for clipboard wipe
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clipboardTimer > 0) {
      interval = setInterval(() => {
        setClipboardTimer((prev) => {
          if (prev <= 1) {
            // Wipe clipboard
            Clipboard.setStringAsync('');
            Alert.alert('Clipboard Cleared', 'Mnemonic removed from clipboard cache for security.');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clipboardTimer]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(mnemonic);
    setClipboardTimer(30);
    Alert.alert('Copied', 'Seed phrase copied to clipboard. It will be cleared in 30 seconds for security.');
  };

  const handleCloudSave = () => {
    // Navigate to CloudBackup with the mnemonic
    navigation.navigate('CloudBackup', { mode: 'export', mnemonic });
  };

  const handleDownloadTxt = async () => {
    const fileContent = `CloudVoid Wallet Secret Recovery Phrase:\n\n${mnemonic}\n\nKeep this safe. Do not share with anyone.`;
    if (Platform.OS === 'web') {
      const element = document.createElement("a");
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "cloudvoid_secret_phrase.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      Alert.alert('Success', 'Backup text file downloaded successfully.');
    } else {
      try {
        const fileUri = FileSystem.documentDirectory + 'cloudvoid_secret_phrase.txt';
        await FileSystem.writeAsStringAsync(fileUri, fileContent, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri);
      } catch (err: any) {
        Alert.alert('Error', 'Could not save backup file: ' + err.message);
      }
    }
  };

  const handleContinue = () => {
    navigation.navigate('SeedPhraseVerify', { mnemonic });
  };

  const words = mnemonic.split(' ');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Your Secret Recovery Phrase</Text>
        <Text style={styles.warningSub}>
          Write down these 12 words in order. You will not be shown them again. Keep them offline!
        </Text>
      </View>

      {/* Top Copy Section */}
      <View style={styles.topCopyContainer}>
        <TouchableOpacity 
          style={[styles.copyBtn, CloudVoidTheme.shadows.neonViolet]} 
          onPress={handleCopy}
        >
          <Text style={styles.copyBtnText}>
            {clipboardTimer > 0 ? `Wiping Cache (${clipboardTimer}s)` : 'Copy Seed Phrase'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2-Column Word Grid */}
      <View style={styles.grid}>
        {words.map((word, idx) => (
          <View key={idx} style={styles.wordBox}>
            <Text style={styles.wordIndex}>{idx + 1}.</Text>
            {isBlurred ? (
              <TouchableOpacity onPress={() => setIsBlurred(false)} style={styles.revealOverlay}>
                <Text style={styles.revealText}>Tap to reveal</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.wordText}>{word}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Amber Warning Block */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningTitle}>⚠️ Security Mandate</Text>
        <Text style={styles.warningBody}>
          You are only shown this 12-key phrase once. Copy it and save it securely. No screenshots should be taken.
        </Text>
      </View>

      {/* Bottom Action / Backup Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleCloudSave}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.secondaryBtnText}>Google</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleDownloadTxt}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.secondaryBtnText}>Save to File</Text>
          </View>
        </TouchableOpacity>

        {/* Primary Continue Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>I've Secured My Recovery Phrase</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000000',
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 50,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 10,
  },
  warningSub: {
    fontSize: 14,
    color: CloudVoidTheme.colors.warning,
    lineHeight: 20,
    fontWeight: '600',
  },
  topCopyContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  copyBtnText: {
    color: CloudVoidTheme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  wordBox: {
    width: '48%',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
  },
  wordIndex: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    marginRight: 8,
    fontWeight: '600',
    width: 20,
  },
  wordText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  revealOverlay: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  revealText: {
    color: CloudVoidTheme.colors.accentGlow,
    fontSize: 13,
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CloudVoidTheme.colors.warning,
    marginBottom: 6,
  },
  warningBody: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 18,
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
    marginTop: 12,
  },
  primaryBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
