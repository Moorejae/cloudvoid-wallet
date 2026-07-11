import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { API_BASE_URL } from '../services/web3Api';

export default function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUserId = useWalletStore((state) => state.setUserId);
  const setEmailStore = useWalletStore((state) => state.setEmail);

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isInputValid = activeTab === 'phone' ? phone.length >= 8 : isEmailValid(email);

  const handleNext = async () => {
    if (!isInputValid || isSubmitting) return;
    setIsSubmitting(true);
    const targetEmail = activeTab === 'email' ? email : `${phone}@cloudvoid.local`;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        setEmailStore(targetEmail);
        navigation.navigate('EmailVerify', { email: targetEmail });
      } else {
        Alert.alert('Login Error', data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Network Error', 'Could not connect to login server. Please try again.');
    }
  };

  const handleSocialAuth = (provider: string) => {
    Alert.alert(`${provider} Login`, `Authenticating via ${provider} OAuth...`);
    // Mock successful login
    setTimeout(() => {
      setUserId('0x2dff76d3614301dd6bc1600b3445d9ed2bbd6c812b0a2a96c5c5fadeabc06ace');
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Support transport channels online.')} style={styles.iconButton}>
          <Text style={styles.iconText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Log in</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('phone')}
        >
          <Text style={[styles.tabText, activeTab === 'phone' ? styles.tabActiveText : null]}>Phone</Text>
          {activeTab === 'phone' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('email')}
        >
          <Text style={[styles.tabText, activeTab === 'email' ? styles.tabActiveText : null]}>Email/sub-account</Text>
          {activeTab === 'email' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      {activeTab === 'phone' ? (
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.countryDropdown} onPress={() => Alert.alert('Country Codes', 'Nigeria (+234) is set by default.')}>
            <Text style={styles.countryText}>{countryCode} ▼</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      ) : (
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
      )}

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          { backgroundColor: isInputValid && !isSubmitting ? CloudVoidTheme.colors.accent : '#2a2a2a' }
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
          <Text style={styles.socialBtnIcon}>🔑</Text>
          <Text style={styles.socialBtnText}>Passkey</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Google')}>
          <Text style={styles.socialBtnIcon}>🔍</Text>
          <Text style={styles.socialBtnText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Telegram')}>
          <Text style={styles.socialBtnIcon}>✈️</Text>
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
