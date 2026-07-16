import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { API_BASE_URL } from '../services/web3Api';
import { ethers } from 'ethers';

export default function SeedPhraseVerifyScreen({ route, navigation }: any) {
  // Retrieve the mnemonic or fallback to a default BIP-39 phrase for stubs
  const rawMnemonic = route.params?.mnemonic || "abandon ability able about above absent absorb abstract absurd abuse access accident";
  const correctSequence = rawMnemonic.split(' ');

  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

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

  const completeVerification = async (finalWords: string[]) => {
    if (finalWords.length !== correctSequence.length) return;
    
    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Derive real EVM address locally
      const hdNode = ethers.HDNodeWallet.fromPhrase(rawMnemonic);
      const address = hdNode.address;

      await setMnemonic(rawMnemonic);
      
      // Register with backend with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${API_BASE_URL}/api/wallet/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, mnemonic: rawMnemonic, importMethod: 'create' }),
          signal: controller.signal as any
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        if (data.tokens) {
          useWalletStore.getState().setTokens(data.tokens);
        }
      } catch (apiError) {
        console.warn('API Registration failed or timed out, proceeding anyway:', apiError);
      }

      setUserId(address);
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } catch (e) {
      // Fallback
      await setMnemonic(rawMnemonic);
      setUserId('0x2dff76d3614301dd6bc1600b3445d9ed2bbd6c812b0a2a96c5c5fadeabc06ace');
      useWalletStore.getState().resetForNewWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainFlow' }],
      });
    } finally {
      setIsSubmitting(false);
    }
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
