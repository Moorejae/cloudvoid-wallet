import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';

type RegisterStep = 'email' | 'details';

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState<RegisterStep>('email');
  const [email, setEmail] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  
  // Step 2 details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  
  // Password Strength Criteria
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: '#4b5563' };
    let score = 0;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: CloudVoidTheme.colors.danger };
    if (score <= 4) return { score, label: 'Medium', color: CloudVoidTheme.colors.warning };
    return { score, label: 'Strong', color: CloudVoidTheme.colors.success };
  };

  const passStrength = calculatePasswordStrength(password);

  const isStep1Valid = isEmailValid(email);
  const isStep2Valid = 
    username.length >= 3 && 
    password.length >= 12 && 
    password === confirmPassword && 
    passStrength.label !== 'Weak';

  const handleStep1Submit = () => {
    if (!isStep1Valid) return;
    setStep('details');
  };

  const handleCreateAccount = () => {
    if (!isStep2Valid) return;
    // Dispatch mock registration request
    navigation.navigate('EmailVerify', { email, username });
  };

  const handleSocialAuth = (provider: string) => {
    Alert.alert(`${provider} Registration`, `Authenticating via ${provider} OAuth...`);
  };

  if (step === 'details') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setStep('email')} style={styles.iconButton}>
            <Text style={styles.iconText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Create your account</Text>
        </View>

        {/* Username */}
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              autoCapitalize="none"
              value={username}
              onChangeText={(text) => setUsername(text.replace(/[^a-zA-Z0-9_]/g, ''))}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Min 12 characters"
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarOuter}>
                <View 
                  style={[
                    styles.strengthBarInner, 
                    { 
                      width: `${(passStrength.score / 5) * 100}%`,
                      backgroundColor: passStrength.color 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.strengthLabel, { color: passStrength.color }]}>{passStrength.label}</Text>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: isStep2Valid ? CloudVoidTheme.colors.accent : '#2a2a2a' }
          ]}
          onPress={handleCreateAccount}
          disabled={!isStep2Valid}
        >
          <Text style={[styles.nextBtnText, { color: isStep2Valid ? CloudVoidTheme.colors.textPrimary : CloudVoidTheme.colors.textSecondary }]}>
            Create Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Support pathways loaded.')} style={styles.iconButton}>
          <Text style={styles.iconText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Header Text */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>What's your email?</Text>
        <Text style={styles.subtitle}>You'll use this email address to verify your account and receive secure updates.</Text>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor={CloudVoidTheme.colors.textDisabled}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Referral */}
      <TouchableOpacity 
        style={styles.referralToggle}
        onPress={() => setShowReferral(!showReferral)}
      >
        <Text style={styles.referralLink}>Have a referral code?</Text>
      </TouchableOpacity>

      {showReferral && (
        <View style={[styles.inputContainer, { marginTop: 12 }]}>
          <TextInput
            style={styles.input}
            placeholder="Enter referral code"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            autoCapitalize="characters"
            value={referralCode}
            onChangeText={setReferralCode}
          />
        </View>
      )}

      {/* Signup Button */}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          { backgroundColor: isStep1Valid ? CloudVoidTheme.colors.accent : '#2a2a2a', marginTop: 24 }
        ]}
        onPress={handleStep1Submit}
        disabled={!isStep1Valid}
      >
        <Text style={[styles.nextBtnText, { color: isStep1Valid ? CloudVoidTheme.colors.textPrimary : CloudVoidTheme.colors.textSecondary }]}>
          Sign up
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
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Google')}>
          <Text style={styles.socialBtnIcon}>🔍</Text>
          <Text style={styles.socialBtnText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialAuth('Telegram')}>
          <Text style={styles.socialBtnIcon}>✈️</Text>
          <Text style={styles.socialBtnText}>Telegram</Text>
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
    fontSize: 16,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textSubHeader,
    lineHeight: 22,
  },
  inputLabelContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: CloudVoidTheme.radii.input,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 56,
  },
  prefix: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 16,
    marginRight: 4,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  referralToggle: {
    alignSelf: 'flex-start',
  },
  referralLink: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
    textDecorationLine: 'underline',
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarInner: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.danger,
    marginTop: 6,
  },
});
