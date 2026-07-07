import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function TopUpUSDTScreen({ navigation }: any) {
  const [amount, setAmount] = useState('500.00');

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
        <Text style={styles.headerTitle}>Top-up with USDT</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Graphic */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#2a3b52', '#3f5773', '#1e293b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGraphic}
          >
            {/* Top Row: Brand & Type */}
            <View style={styles.cardTopRow}>
              <Text style={styles.brandText}>
                <Text style={{ fontWeight: '800' }}>CLOUD</Text>VOID
              </Text>
              
              <View style={styles.cardTypeContainer}>
                <Ionicons name="cloud-outline" size={24} color={CloudVoidTheme.colors.textPrimary} />
                <Text style={styles.cardTypeText}>DEBIT</Text>
              </View>
            </View>

            {/* Chip */}
            <LinearGradient
              colors={['#d1d5db', '#9ca3af']}
              style={styles.chip}
            >
              <View style={styles.chipLine1} />
              <View style={styles.chipLine2} />
              <View style={styles.chipLine3} />
            </LinearGradient>

            {/* Card Number */}
            <Text style={styles.cardNumber}>****  ****  1234</Text>

            {/* Bottom Row: Details & Network */}
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardExpiry}>08/28</Text>
                <Text style={styles.cardHolder}>M. Thompson</Text>
              </View>
              
              {/* Mastercard Logo Mock */}
              <View style={styles.mastercardLogo}>
                <View style={[styles.mcCircle, { backgroundColor: '#eb001b', left: 10 }]} />
                <View style={[styles.mcCircle, { backgroundColor: '#f79e1b', opacity: 0.8 }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.fundThisCardText}>Fund this Card</Text>

        {/* Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Enter Amount (USDT)</Text>
          
          <View style={styles.inputRow}>
            {/* USDT Logo Mock */}
            <View style={styles.usdtLogoContainer}>
              <View style={styles.usdtCircle}>
                <Text style={styles.usdtText}>₮</Text>
              </View>
              {/* Decorative circuit lines could go here, omitting for simplicity */}
            </View>

            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#6b7280"
            />
            
            <Text style={styles.currencySuffix}>USDT</Text>
          </View>

          <Text style={styles.inputSubtitle}>Top-up flexible amount (10 - 10,000 USDT)</Text>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer Area */}
      <View style={styles.footer}>
        <Text style={styles.feeText}>A 0.5% network fee will be applied.</Text>
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirm USDT Funding</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    width: 60, // To balance the wider back button
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginBottom: 24,
  },
  cardGraphic: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    letterSpacing: 1,
  },
  cardTypeContainer: {
    alignItems: 'center',
  },
  cardTypeText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    justifyContent: 'space-evenly',
    paddingVertical: 4,
  },
  chipLine1: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  chipLine2: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  chipLine3: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  cardNumber: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardExpiry: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 12,
    marginBottom: 4,
  },
  cardHolder: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 48,
    height: 30,
    justifyContent: 'center',
  },
  mcCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
  },
  fundThisCardText: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  usdtLogoContainer: {
    marginRight: 16,
  },
  usdtCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usdtText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  amountInput: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'center',
  },
  currencySuffix: {
    color: '#9ca3af',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  inputSubtitle: {
    color: '#9ca3af',
    fontSize: 11,
  },
  spacer: {
    flex: 1,
    minHeight: 100, // Provides spacious gap for scrolling if needed
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  feeText: {
    color: '#d1d5db',
    fontSize: 11,
    marginBottom: 12,
  },
  confirmBtn: {
    backgroundColor: '#3730a3', // Dark purplish blue as in image
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 15,
    fontWeight: '600',
  },
});
