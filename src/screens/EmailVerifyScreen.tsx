import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { API_BASE_URL } from '../services/web3Api';
import AuthBackgroundVideo from '../components/AuthBackgroundVideo';

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
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[idx] = text.slice(-1);
    setCode(newCode);

    if (text && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
      setFocusedIdx(idx + 1);
    }

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

  const verifyCode = async (otpValue: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      });
      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        setUserId(data.userId);
      } else {
        triggerShake();
        Alert.alert('Verification Failed', data.error || 'The code entered is invalid or expired.');
      }
    } catch (err) {
      setIsSubmitting(false);
      triggerShake();
      Alert.alert('Network Error', 'Could not verify code with server.');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(60);
    try {
      await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      Alert.alert('Code Sent', `A new 6-digit verification code has been sent to ${email}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to resend code.');
    }
  };

  return (
    <AuthBackgroundVideo overlayOpacity={0.65}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={16} color="#F8FAFC" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.header}>
            <Text style={styles.badge}>MULTI-FACTOR SECURITY</Text>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the 6-digit authentication token sent to</Text>
            <Text style={styles.emailHighlight}>{email}</Text>
          </View>

          {/* OTP Code Boxes */}
          <Animated.View style={[styles.codeGrid, { transform: [{ translateX: shakeAnim }] }]}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => { inputRefs.current[idx] = ref; }}
                style={[
                  styles.codeBox,
                  focusedIdx === idx && styles.focusedBox,
                  digit !== '' && styles.filledBox
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
      </View>
    </AuthBackgroundVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  backBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  glassCard: {
    backgroundColor: 'rgba(11, 15, 26, 0.88)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 12,
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  badge: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#A78BFA',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emailHighlight: {
    fontSize: 14.5,
    color: '#A78BFA',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  codeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
    gap: 8,
  },
  codeBox: {
    flex: 1,
    height: 54,
    backgroundColor: 'rgba(6, 8, 16, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  focusedBox: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  filledBox: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  timerRow: {
    alignItems: 'center',
    marginTop: 6,
  },
  timerText: {
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#A78BFA',
    textDecorationLine: 'underline',
  },
});
