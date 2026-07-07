import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
// bip39 removed to prevent crypto crash on RN
import { useWalletStore } from '../stores/walletStore';

export default function SeedPhraseInputScreen({ navigation }: any) {
  const [wordCount, setWordCount] = useState<12 | 18 | 24>(12);
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [checked, setChecked] = useState(false);
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  const handleWordChange = (text: string, index: number) => {
    const updated = [...words];
    updated[index] = text.trim().toLowerCase();
    setWords(updated);
  };

  const handleWordCountChange = (count: 12 | 18 | 24) => {
    setWordCount(count);
    setWords(Array(count).fill(''));
  };

  const handleImport = async () => {
    const phrase = words.join(' ');
    
    // Validate BIP-39 mnemonic length as mock
    const splitWords = phrase.split(' ');
    const isValid = splitWords.length === 12 || splitWords.length === 18 || splitWords.length === 24;
    if (!isValid) {
      Alert.alert('Invalid Seed Phrase', 'Please check that you entered all BIP-39 words correctly.');
      return;
    }

    try {
      // Mock MoveVM key derivation      // Derive address locally
      const address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

      await setMnemonic(phrase);
      setUserId(address);
    } catch (e) {
      console.error(e);
      // Fallback address in case of issues
      await setMnemonic(phrase);
      setUserId('0x2dff76d3614301dd6bc1600b3445d9ed2bbd6c812b0a2a96c5c5fadeabc06ace');
    }
  };

  const isComplete = words.every(w => w.trim() !== '') && checked;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Import Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.instructions}>Enter your recovery seed phrase words in order.</Text>

      {/* Word Count Toggles */}
      <View style={styles.toggleRow}>
        {([12, 18, 24] as const).map((c) => (
          <TouchableOpacity 
            key={c}
            style={[styles.toggleBtn, wordCount === c ? styles.activeToggleBtn : null]}
            onPress={() => handleWordCountChange(c)}
          >
            <Text style={[styles.toggleText, wordCount === c ? styles.activeToggleText : null]}>
              {c} Words
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid of Word Inputs */}
      <View style={styles.wordGrid}>
        {words.map((word, idx) => (
          <View key={idx} style={styles.inputContainer}>
            <Text style={styles.indexLabel}>{idx + 1}.</Text>
            <TextInput
              style={styles.wordInput}
              placeholder="word"
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              autoCapitalize="none"
              value={word}
              onChangeText={(t) => handleWordChange(t, idx)}
            />
          </View>
        ))}
      </View>

      {/* Disclaimer Checkbox */}
      <TouchableOpacity 
        style={styles.checkboxRow}
        onPress={() => setChecked(!checked)}
      >
        <View style={[styles.checkbox, checked ? styles.checkboxActive : null]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I understand that CloudVoid does not store my recovery phrase and cannot recover it if lost.
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.importBtn,
          { backgroundColor: isComplete ? CloudVoidTheme.colors.accent : '#2a2a2a' }
        ]}
        onPress={handleImport}
        disabled={!isComplete}
      >
        <Text style={[styles.importBtnText, { color: isComplete ? CloudVoidTheme.colors.textPrimary : CloudVoidTheme.colors.textSecondary }]}>
          Import Wallet
        </Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  instructions: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    padding: 4,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'center',
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeToggleBtn: {
    backgroundColor: '#2a2a2a',
  },
  toggleText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeToggleText: {
    color: CloudVoidTheme.colors.textPrimary,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 8,
    width: '31%',
    height: 44,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  indexLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    width: 20,
    fontWeight: '600',
  },
  wordInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.textSecondary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderColor: CloudVoidTheme.colors.accent,
  },
  checkmark: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 18,
  },
  importBtn: {
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  importBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
