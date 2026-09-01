import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ScrollView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { deriveAllChainAddresses } from '../services/wallet/derive';
import { saveAddresses, savePrimaryAddress } from '../services/wallet/storage';
import VaultPasswordModal from '../components/VaultPasswordModal';
import { usePreventLeave } from '../hooks/usePreventLeave';

export default function SeedPhraseVerifyScreen({ route, navigation }: any) {
  // Retrieve the mnemonic or fallback to a default BIP-39 phrase for stubs
  const rawMnemonic = route.params?.mnemonic || "abandon ability able about above absent absorb abstract absurd abuse access accident";
  const correctSequence = rawMnemonic.split(' ');
  // When already logged in and reached via "Add New Wallet", completing
  // verification ADDS an extra wallet instead of overwriting the primary.
  const wallets = useWalletStore((state) => state.wallets);
  const isAddMode = route.params?.mode === 'add' && wallets.length > 0;

  // Don't let a half-completed verification be abandoned silently.
  usePreventLeave(navigation, true, {
    title: 'Finish verification',
    message: 'If you leave now, your new recovery phrase will not be saved.',
  });

  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  const [vaultPassword, setVaultPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const pendingWordsRef = useRef<string[]>([]);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scramble the words on mount
    const scrambled = [...correctSequence].sort(() => Math.random() - 0.5);
    setScrambledWords(scrambled);
  }, []);

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true })
    ]).start();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalizeWallet = async (password?: string) => {
    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Derive ALL 15 chain addresses locally — the backend never sees the mnemonic.
      const chains = deriveAllChainAddresses(rawMnemonic);
      const addresses: Record<string, string> = {};
      for (const [id, c] of Object.entries(chains)) {
        if (c.address) addresses[id] = c.address;
      }

      if (isAddMode) {
        // "Add New Wallet": keep the primary wallet untouched, add a new one.
        const nextIndex = wallets.length + 1;
        await useWalletStore.getState().addExtraWallet(`Wallet ${nextIndex}`, rawMnemonic, addresses, password);
        Alert.alert('Wallet Added', `A new wallet has been added and is now active.`);
        navigation.popToTop();
        return;
      }

      const primary = addresses.eth || '';

      await setMnemonic(rawMnemonic, password);
      await saveAddresses(addresses);
      if (primary) await savePrimaryAddress(primary);

      setUserId(primary || null);
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } catch (e: any) {
      Alert.alert('Setup Error', e?.message || 'Could not finalize your wallet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeVerification = (finalWords: string[]) => {
    if (finalWords.length !== correctSequence.length) return;

    // Web vault requires a password before we encrypt the mnemonic.
    if (Platform.OS === 'web' && !vaultPassword) {
      pendingWordsRef.current = finalWords;
      setShowPasswordModal(true);
      return;
    }
    finalizeWallet(Platform.OS === 'web' ? vaultPassword : undefined);
  };

  const handlePasswordConfirm = (password: string) => {
    setVaultPassword(password);
    setShowPasswordModal(false);
    finalizeWallet(password);
  };

  const handleWordSelect = (word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const nextIdx = selectedWords.length;
    const isCorrect = correctSequence[nextIdx] === word;

    if (isCorrect) {
      const newSelectedWords = [...selectedWords, word];
      setSelectedWords(newSelectedWords);

      // Remove only the first instance of the word from the scrambled grid
      const indexToRemove = scrambledWords.findIndex((w) => w === word);
      if (indexToRemove !== -1) {
        const newScrambled = [...scrambledWords];
        newScrambled.splice(indexToRemove, 1);
        setScrambledWords(newScrambled);
      }
      
      if (newSelectedWords.length === correctSequence.length) {
        completeVerification(newSelectedWords);
      }
    } else {
      triggerShake();
      // Reset sequence
      setSelectedWords([]);
      // Rescramble remaining/all words
      const scrambled = [...correctSequence].sort(() => Math.random() - 0.5);
      setScrambledWords(scrambled);
      Alert.alert('Incorrect Selection', 'You selected the wrong word. The verification sequence has been reset.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Verify your phrase</Text>
        <Text style={styles.subtitle}>Arrange the phrase in order:</Text>
      </View>

      {/* Selected Sequence indicator */}
      <View style={styles.sequenceContainer}>
        <Text style={styles.sequenceLabel}>Selected Sequence:</Text>
        <View style={styles.sequenceRow}>
          {selectedWords.map((word, idx) => (
            <View key={idx} style={styles.selectedWordTag}>
              <Text style={styles.selectedWordText}>{idx + 1}. {word}</Text>
            </View>
          ))}
          {selectedWords.length === 0 && (
            <Text style={styles.placeholderText}>Tap words below to begin...</Text>
          )}
        </View>
      </View>

      {/* Scrambled Words Buttons Grid */}
      <Animated.View style={[styles.wordsGrid, { transform: [{ translateX: shakeAnim }] }]}>
        {scrambledWords.map((word, idx) => (
          <TouchableOpacity 
            key={idx}
            style={styles.wordBtn}
            onPress={() => handleWordSelect(word)}
          >
            <Text style={styles.wordBtnText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {isSubmitting && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: CloudVoidTheme.colors.success, fontSize: 16 }}>Setting up your wallet...</Text>
        </View>
      )}

      <VaultPasswordModal
        visible={showPasswordModal}
        mode="set"
        onConfirm={handlePasswordConfirm}
      />
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
  subtitle: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textSubHeader,
  },
  sequenceContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    minHeight: 100,
  },
  sequenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedWordTag: {
    backgroundColor: CloudVoidTheme.colors.accentDark,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectedWordText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderText: {
    color: CloudVoidTheme.colors.textDisabled,
    fontSize: 14,
    fontStyle: 'italic',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 40,
  },
  wordBtn: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 8,
    width: '30%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
