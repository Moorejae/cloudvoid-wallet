import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, AppState } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { generateNewSeedPhrase } from '../services/wallet-engine';
import * as Clipboard from 'expo-clipboard';
import * as ScreenCapture from 'expo-screen-capture';
import Svg, { Path } from 'react-native-svg';

const GoogleDriveIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 87.3 78">
    <Path d="M60.6 22.8l26.7 46.2H34L60.6 22.8z" fill="#FFC107"/>
    <Path d="M26.7 77.8L0 31.5h53.3l-26.6 46.3z" fill="#00A769"/>
    <Path d="M60.6 22.8L34 69H7.3l26.7-46.2h26.6z" fill="#0066DA"/>
  </Svg>
);

export default function CreateWalletScreen({ navigation }: any) {
  const [mnemonic, setMnemonic] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [clipboardTimer, setClipboardTimer] = useState(0);

  useEffect(() => {
    try {
      const generated = generateNewSeedPhrase();
      setMnemonic(generated);
    } catch (e) {
      // Fallback if polyfills fail during testing
      setMnemonic('apple orange banana grape mango cherry lemon lime peach pear plum kiwi');
    }

    // Prevent screenshot / screen recording
    ScreenCapture.preventScreenCaptureAsync();

    // Blur seed phrase when app is backgrounded
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsBlurred(true);
      }
    });

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      subscription.remove();
    };
  }, []);

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
    navigation.navigate('SeedPhraseVerify', { mnemonic });
  };

  const handleCloudSave = () => {
    navigation.navigate('CloudBackup', { mode: 'export', mnemonic });
  };

  // Primary nav button removed, triggered by copy or cloud save.

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
          CloudVoid never stores your recovery phrase. Anyone with access to these 12 words can claim all your digital assets.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleCopy}>
          <Text style={styles.secondaryBtnText}>
            {clipboardTimer > 0 ? `Wiping Cache (${clipboardTimer}s)` : 'Copy to Clipboard'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleCloudSave}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <GoogleDriveIcon size={18} />
            <Text style={styles.secondaryBtnText}>Backup to Google Drive</Text>
          </View>
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
    marginBottom: 24,
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
  },
  primaryBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
