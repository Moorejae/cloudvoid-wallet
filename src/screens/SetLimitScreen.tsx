import React, { useState } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

export default function SetLimitScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'Daily' | 'Monthly'>('Daily');
  const [amount, setAmount] = useState('1,000.00');

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
        <Text style={styles.headerTitle}>Set Limit</Text>
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
              
              <View style={styles.mastercardLogo}>
                <View style={[styles.mcCircle, { backgroundColor: '#eb001b', left: 10 }]} />
                <View style={[styles.mcCircle, { backgroundColor: '#f79e1b', opacity: 0.8 }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Configuration Card */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Configure Transaction Limits</Text>
          <Text style={styles.configSubtitle}>Set a maximum amount for individual card transactions.</Text>

          {/* Segmented Control */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeTab === 'Daily' && styles.segmentActive]}
              onPress={() => setActiveTab('Daily')}
            >
              <Text style={[styles.segmentText, activeTab === 'Daily' && styles.segmentTextActive]}>Daily</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.segmentBtn, activeTab === 'Monthly' && styles.segmentActive]}
              onPress={() => setActiveTab('Monthly')}
            >
              <Text style={[styles.segmentText, activeTab === 'Monthly' && styles.segmentTextActive]}>Monthly</Text>
            </TouchableOpacity>
          </View>

          {/* Limit Input Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="calculator" size={20} color="#4c1d95" />
            </View>
            
            <View style={styles.inputContent}>
              <View style={styles.inputHeaderRow}>
                <Text style={styles.inputLabel}>Set individual limit amount (USDT)</Text>
                {/* AI Sparkle Icon Mock */}
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#a855f7" />
                </Svg>
              </View>
              
              <View style={styles.inputValRow}>
                <TextInput 
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.currencyText}>USDT</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.inputHelperText}>Enter amount in USDT</Text>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>AI has configured these limits based on your profile.</Text>
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirm Limits</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light background as shown in image
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
    color: '#111827',
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
  cardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
  chipLine1: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  chipLine2: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  chipLine3: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
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
  cardExpiry: { color: CloudVoidTheme.colors.textPrimary, fontSize: 12, marginBottom: 4 },
  cardHolder: { color: CloudVoidTheme.colors.textPrimary, fontSize: 14, fontWeight: '500' },
  mastercardLogo: { flexDirection: 'row', alignItems: 'center', width: 48, height: 30, justifyContent: 'center' },
  mcCircle: { width: 30, height: 30, borderRadius: 15, position: 'absolute' },
  
  configCard: {
    backgroundColor: CloudVoidTheme.colors.textPrimary,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  configTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  configSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#d8b4fe',
  },
  segmentText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#4c1d95',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 12,
  },
  inputIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputLabel: {
    color: '#4b5563',
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
  },
  inputValRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amountInput: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '600',
    padding: 0,
    marginRight: 6,
  },
  currencyText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputHelperText: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
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
    backgroundColor: '#1e1b4b',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '600',
  },
});
