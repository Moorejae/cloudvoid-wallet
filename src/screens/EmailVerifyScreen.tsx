import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';

export default function EmailVerifyScreen({ route, navigation }: any) {
  const email = route.params?.email || 'user@email.com';
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [timer, setTimer] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUserId = useWalletStore((state) => state.setUserId);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start countdown
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
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

  const handleTextChange = (text: string, idx: number) => {
    if (!/^\d*$/.test(text)) return; // Digits only

    const newCode = [...code];
    newCode[idx] = text.slice(-1);
    setCode(newCode);

    if (text && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
      setFocusedIdx(idx + 1);
    }

    // Trigger verify if code is complete
    if (newCode.every((digit) => digit !== '') && idx === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!code[idx] && idx > 0) {
        const newCode = [...code];
        newCode[idx - 1] = '';
        setCode(newCode);
        inputRefs.current[idx - 1]?.focus();
        setFocusedIdx(idx - 1);
      }
    }
  };

  const verifyCode = async (fullCode: string) => {
    setIsSubmitting(true);
    // Simulate API call to backend /api/auth/verify-otp
    setTimeout(() => {
      setIsSubmitting(false);
      // Let's accept any code starting with 1 or 7, or mock success
      if (fullCode === '000000' || fullCode.startsWith('1') || fullCode.startsWith('5')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Successful verification -> navigate to WalletSetupScreen
        navigation.navigate('WalletSetup');
      } else {
        triggerShake();
        // Clear code inputs
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        setFocusedIdx(0);
        Alert.alert('Verification Failed', 'Invalid code entered. Please try again or use code "111111".');
      }
    }, 1500);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(60);
    setCode(Array(6).fill(''));
    inputRefs.current[0]?.focus();
    setFocusedIdx(0);
    Alert.alert('OTP Dispatched', 'A new 6-digit verification code has been sent.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>We sent a 6-digit verification code to</Text>
        <Text style={styles.emailHighlight}>{email}</Text>
      </View>

      {/* 6 Boxes OTP Input Grid */}
      <Animated.View style={[styles.codeGrid, { transform: [{ translateX: shakeAnim }] }]}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            style={[
              styles.codeBox,
              focusedIdx === idx ? styles.focusedBox : null
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(t) => handleTextChange(t, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            onFocus={() => setFocusedIdx(idx)}
            editable={!isSubmitting}
          />
        ))}
      </Animated.View>

      {/* Countdown Timer */}
      <View style={styles.timerRow}>
        <Text style={styles.timerText}>
          {timer > 0 
            ? `Resend code in 00:${timer.toString().padStart(2, '0')}`
            : "Didn't receive it?"
          }
        </Text>
        
        {timer === 0 && (
          <TouchableOpacity onPress={handleResend} style={{ marginTop: 8 }}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 50,
  },
  topBar: {
    marginBottom: 40,
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
    marginBottom: 40,
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
    lineHeight: 22,
  },
  emailHighlight: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  codeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    marginBottom: 40,
  },
  codeBox: {
    width: 48,
    height: 52,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: CloudVoidTheme.radii.input,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  focusedBox: {
    borderColor: CloudVoidTheme.colors.accent,
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  timerRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerText: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: CloudVoidTheme.colors.accent,
    textDecorationLine: 'underline',
  },
});
