import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function TwoFASetupScreen({ navigation }: any) {
  const [pin, setPin] = useState('');
  const [authCode, setAuthCode] = useState('');
  const setupKey = 'abcd 1234 efgh';

  const handleCopy = () => {
    Alert.alert('Copied', 'Setup key copied to clipboard.');
  };

  const handleCompleteSetup = () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit login PIN.');
      return;
    }
    if (authCode.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your authenticator app.');
      return;
    }
    Alert.alert('Success', '2FA has been successfully configured!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* QR Code Visual */}
        <View style={styles.qrContainer}>
          <Ionicons name="qr-code" size={180} color="#8b5cf6" />
        </View>

        {/* Info & Copy Key */}
        <Text style={styles.scanInstruction}>
          Scan this code in your authenticator app or copy the key below.
        </Text>

        <TouchableOpacity style={styles.keyBox} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={18} color="#9ca3af" style={{ marginRight: 6 }} />
          <Text style={styles.setupKeyText}>{setupKey}</Text>
        </TouchableOpacity>

        {/* Input fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.pillInput}
            placeholder="Set 6-digit authenticator code"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            value={authCode}
            onChangeText={setAuthCode}
            maxLength={6}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.pillInput}
            placeholder="Input 4-digit PIN Code"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
            maxLength={4}
          />
        </View>

        {/* Large Empty Bottom Space */}
        <View style={styles.spacer} />

        {/* Confirm Button */}
        <TouchableOpacity 
          style={[
            styles.confirmBtn, 
            (pin.length === 4 && authCode.length === 6) ? styles.confirmBtnActive : null
          ]} 
          onPress={handleCompleteSetup}
        >
          <Text style={styles.confirmBtnText}>Confirm 2FA</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: CloudVoidTheme.colors.bg,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  qrContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#161624',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  scanInstruction: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  keyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 32,
  },
  setupKeyText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#1b1b2a',
    borderRadius: 30,
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pillInput: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
  },
  spacer: {
    flex: 1,
    minHeight: 60,
  },
  confirmBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 30,
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  confirmBtnActive: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  confirmBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '600',
  },
});
