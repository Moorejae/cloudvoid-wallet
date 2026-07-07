import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function ConvertFiatScreen({ navigation }: any) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState('1,000.00');

  // Simple mock conversion
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const receiveAmount = (numericAmount * 1.0003).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        <Text style={styles.headerTitle}>Fiat to USDT Convert</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Integrated Conversion Control Card */}
        <View style={styles.controlCard}>
          
          {/* Card Brand Header */}
          <View style={styles.cardTopRow}>
            <Text style={styles.brandText}>
              <Text style={{ fontWeight: '800' }}>CLOUD</Text>VOID
            </Text>
            <Ionicons name="cloud-outline" size={28} color={CloudVoidTheme.colors.textPrimary} />
          </View>

          {/* Currency Segment Selector */}
          <View style={styles.segmentControl}>
            {['GBP', 'USD', 'EURO'].map((curr) => (
              <TouchableOpacity 
                key={curr}
                style={[styles.segmentBtn, selectedCurrency === curr && styles.segmentBtnActive]}
                onPress={() => setSelectedCurrency(curr)}
              >
                <Text style={[styles.segmentText, selectedCurrency === curr && styles.segmentTextActive]}>
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter amount in {selectedCurrency}</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#6b7280"
              />
              <Text style={styles.currencySuffix}>{selectedCurrency}</Text>
            </View>
          </View>

          {/* Rate Data */}
          <View style={styles.rateSection}>
            <View style={styles.aiRateIcon}>
              <Ionicons name="diamond" size={16} color="#c084fc" />
            </View>
            <View style={styles.rateTextContainer}>
              <Text style={styles.rateLabel}>Current Rate (Pyth Network):</Text>
              <Text style={styles.rateValue}>1.00 {selectedCurrency} = 1.0003 USDT</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Receive Section */}
          <View style={styles.receiveSection}>
            <Text style={styles.receiveLabel}>Receive (USDT)</Text>
            <Text style={styles.receiveAmount}>{receiveAmount} USDT</Text>
          </View>

        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>AI has configured these rates based on Pyth network data.</Text>
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirm USDT Purchase</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a', // Dark theme background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerRight: {
    width: 60,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  controlCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // translucent dark slate
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 24,
  },
  brandText: { 
    color: CloudVoidTheme.colors.textPrimary, 
    fontSize: 16, 
    letterSpacing: 1 
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 32,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  segmentBtnActive: {
    backgroundColor: '#a78bfa', // Purple highlight
    shadowColor: '#a78bfa',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  segmentText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: CloudVoidTheme.colors.textPrimary,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    padding: 0,
  },
  currencySuffix: {
    color: '#9ca3af',
    fontSize: 20,
    fontWeight: '600',
  },
  rateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  aiRateIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rateTextContainer: {
    flex: 1,
  },
  rateLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
  },
  rateValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    marginBottom: 24,
  },
  receiveSection: {
    gap: 4,
  },
  receiveLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  receiveAmount: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerNote: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: '#3730a3', // Dark purple
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#3730a3',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  confirmBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '600',
  },
});
