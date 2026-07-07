import React, { useState } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddPaymentMethodScreen({ navigation }: any) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleConfirm = () => {
    // Navigate back to the dashboard, representing a successful add
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={styles.headerBtnRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Name / Payment Service</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Access Bank, OPay"
                placeholderTextColor="#6b7280"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="0123456789"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Exact name on account"
                placeholderTextColor="#6b7280"
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>
          </View>
          
          <Text style={styles.hintText}>
            Ensure your account name exactly matches your verified legal name on this platform to avoid P2P transaction issues.
          </Text>

        </View>
      </ScrollView>

      {/* Bottom Action - Large Space Above it is handled by flex: 1 and placing this outside ScrollView or pushing it down */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[
            styles.confirmBtn, 
            (!bankName || !accountNumber || !accountName) && styles.confirmBtnDisabled
          ]} 
          onPress={handleConfirm}
          disabled={!bankName || !accountNumber || !accountName}
        >
          <Text style={styles.confirmBtnText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#12121a',
    zIndex: 10,
  },
  headerBtn: {
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
    fontSize: 16,
    fontWeight: '700',
  },
  headerBtnRight: {
    width: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  hintText: {
    color: '#fbbf24',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomSection: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#12121a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  confirmBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 100,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '700',
  },
});
