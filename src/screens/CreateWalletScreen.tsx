import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, AppState, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useFocusEffect } from '@react-navigation/native';
import { generateNewSeedPhrase } from '../services/wallet/derive';
import 'react-native-get-random-values';
import * as Clipboard from 'expo-clipboard';
import * as ScreenCapture from 'expo-screen-capture';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AuthBackgroundVideo from '../components/AuthBackgroundVideo';
import { usePreventLeave } from '../hooks/usePreventLeave';

export default function CreateWalletScreen({ navigation, route }: any) {
  const [mnemonic, setMnemonic] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [clipboardTimer, setClipboardTimer] = useState(0);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Never silently abandon a freshly generated seed phrase.
  usePreventLeave(navigation, true, {
    title: 'Secure your phrase first',
    message: 'You are about to leave without confirming your new recovery phrase. You will lose it.',
  });

  useFocusEffect(
    React.useCallback(() => {
      let phrase: string;
      let phraseArray: string[];
      do {
        phrase = generateNewSeedPhrase();
        phraseArray = phrase.split(' ');
      } while (new Set(phraseArray).size !== 12);

      setMnemonic(phrase);
      setIsBlurred(false);

      if (Platform.OS !== 'web') {
        try {
          ScreenCapture.preventScreenCaptureAsync();
        } catch (e) {}
      }

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          setIsBlurred(true);
          let newPhrase: string;
          let newArray: string[];
          do {
            newPhrase = generateNewSeedPhrase();
            newArray = newPhrase.split(' ');
          } while (new Set(newArray).size !== 12);

          setMnemonic(newPhrase);
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clipboardTimer > 0) {
      interval = setInterval(() => {
        setClipboardTimer((prev) => {
          if (prev <= 1) {
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
    navigation.navigate('CloudBackup', { mode: 'export', mnemonic, walletMode: route?.params?.mode });
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
        const baseDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? '';
        const fileUri = baseDir + 'cloudvoid_secret_phrase.txt';
        await FileSystem.writeAsStringAsync(fileUri, fileContent, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri);
      } catch (err: any) {
        Alert.alert('Error', 'Could not save backup file: ' + err.message);
      }
    }
  };

  const handleContinue = () => {
    navigation.navigate('SeedPhraseVerify', { mnemonic, mode: route?.params?.mode });
  };

  const words = mnemonic.split(' ');

  return (
    <AuthBackgroundVideo overlayOpacity={isDesktop ? 0.55 : 0.65}>
      <ScrollView contentContainerStyle={[styles.container, isDesktop && styles.desktopContainer]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="#ffffff" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Secret Recovery Phrase</Text>
            <Text style={styles.warningSub}>
              Write down these 12 words in exact order and store them offline. Never share them with anyone.
            </Text>
          </View>

          {/* Top Copy Section */}
          <View style={styles.topCopyContainer}>
            <TouchableOpacity 
              style={styles.copyBtn} 
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={16} color={CloudVoidTheme.colors.accent} />
              <Text style={styles.copyBtnText}>
                {clipboardTimer > 0 ? `Auto-Clearing Cache (${clipboardTimer}s)` : 'Copy 12 Words'}
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

          {/* Security Mandate */}
          <View style={styles.warningBanner}>
            <Ionicons name="shield-outline" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Security Protocol</Text>
              <Text style={styles.warningBody}>
                You are shown this master key once. CloudVoid cannot recover lost seed phrases.
              </Text>
            </View>
          </View>

          {/* Bottom Action / Backup Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.backupOptionsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleCloudSave}>
                <Ionicons name="cloud-upload-outline" size={16} color={CloudVoidTheme.colors.accent} />
                <Text style={styles.secondaryBtnText}>Google Cloud Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={handleDownloadTxt}>
                <Ionicons name="download-outline" size={16} color="#ffffff" />
                <Text style={styles.secondaryBtnText}>Save to File</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Continue Button */}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>I've Secured My Recovery Phrase</Text>
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
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  desktopContainer: {
    maxWidth: 580,
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
    marginBottom: 16,
  },
  badge: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 2,
    color: CloudVoidTheme.colors.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  warningSub: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 19,
  },
  topCopyContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  copyBtnText: {
    color: CloudVoidTheme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  wordBox: {
    width: '48%',
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
  },
  wordIndex: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginRight: 8,
    fontWeight: '700',
    width: 22,
  },
  wordText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  revealOverlay: {
    flex: 1,
  },
  revealText: {
    color: CloudVoidTheme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 2,
  },
  warningBody: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 17,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  backupOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  primaryBtnText: {
    color: '#060810',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
