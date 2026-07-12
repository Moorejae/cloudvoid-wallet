import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { API_BASE_URL } from '../services/web3Api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUserId = useWalletStore((state) => state.setUserId);
  const setEmailStore = useWalletStore((state) => state.setEmail);

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isInputValid = isEmailValid(email);

  const handleNext = async () => {
    if (!isInputValid || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        setEmailStore(email);
        navigation.navigate('EmailVerify', { email });
      } else {
        Alert.alert('Login Error', data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Network Error', 'Could not connect to login server. Please try again.');
    }
  };

  const handleSocialAuth = async (provider: string) => {
    if (provider === 'Google') {
      const clientId = '141857948281-547s5hcr7t0j3sbfepd23282fshd232a.apps.googleusercontent.com';
      const redirectUri = window.location.origin + '/';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=openid%20profile%20email` +
        `&state=google`;
      window.location.href = authUrl;
    } else if (provider === 'Telegram') {
      const botId = '7183901234'; // Authentic Bot ID config
      const redirectUri = window.location.origin + '/';
      const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}` +
        `&origin=${encodeURIComponent(window.location.origin)}` +
        `&embed=1` +
        `&request_access=write` +
        `&return_to=${encodeURIComponent(redirectUri)}`;
      window.location.href = authUrl;
    } else if (provider === 'Passkey') {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          Alert.alert('Passkey Error', 'No biometrics set up on this device. Please log in with email first and enable Passkey in Settings.');
          return;
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate with Passkey / Biometrics'
        });
        if (result.success) {
          const response = await fetch(`${API_BASE_URL}/api/auth/passkey-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceAuth: true })
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setUserId(data.userId);
            setEmailStore(data.email);
            Alert.alert('Welcome Back', `Successfully logged in via Passkey!`);
          } else {
            Alert.alert('Passkey Error', data.error || 'No registered Passkey found. Please log in via email first.');
          }
        }
      } catch (err) {
        Alert.alert('Passkey Error', 'Biometric authentication failed.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Log in</Text>
      </View>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={CloudVoidTheme.colors.textDisabled}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          { backgroundColor: isInputValid && !isSubmitting ? CloudVoidTheme.colors.accent : '#2a2a2a', marginTop: 24 }
        ]}
        onPress={handleNext}
        disabled={!isInputValid || isSubmitting}
      >
        <Text style={[styles.nextBtnText, { color: isInputValid && !isSubmitting ? CloudVoidTheme.colors.btnText : CloudVoidTheme.colors.textSecondary }]}>
          {isSubmitting ? 'Sending OTP...' : 'Next'}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Passkey')}>
          <Text style={styles.socialBtnText}>Passkey</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Google')}>
          <Text style={styles.socialBtnText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Telegram')}>
          <Text style={styles.socialBtnText}>Telegram</Text>
        </TouchableOpacity>
      </View>

      {/* Footnote */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Sign up</Text>
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
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  titleSection: {
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    paddingBottom: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabActiveText: {
    color: CloudVoidTheme.colors.textPrimary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: CloudVoidTheme.colors.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: CloudVoidTheme.radii.input,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    height: 56,
  },
  countryDropdown: {
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: CloudVoidTheme.colors.border,
  },
  countryText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  nextBtn: {
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 56,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    marginHorizontal: 16,
  },
  socialContainer: {
    gap: 12,
    marginBottom: 40,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 14,
    paddingHorizontal: 20,
    height: 52,
  },
  socialBtnIcon: {
    fontSize: 18,
    marginRight: 16,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: CloudVoidTheme.colors.accent,
    textDecorationLine: 'underline',
  },
});
