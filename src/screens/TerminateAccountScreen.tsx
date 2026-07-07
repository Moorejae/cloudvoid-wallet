import React, { useState } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function TerminateAccountScreen({ navigation }: any) {
  const [reason, setReason] = useState('');

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
        <Text style={styles.headerTitle}>Terminate Account</Text>
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

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ TERMINATION IS PERMANENT ⚠️</Text>
          
          <Text style={styles.warningText}>
            This action will irreversibly delete all local data, local wallet keys, P2P history, local files, and user preferences. All active limits, active merchant rules, and multi-chain connection history will be lost.
          </Text>
          
          <Text style={styles.warningBoldText}>Funds must be migrated before proceeding.</Text>

          {/* Reason Input */}
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Reason for Termination (e.g., wallet security compromised, switching services)"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>A 0.5% network fee will be applied for final state closure.</Text>
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirm Termination</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light background
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
  
  warningCard: {
    backgroundcolor: CloudVoidTheme.colors.textPrimary,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  warningTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningText: {
    color: '#4b5563',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  warningBoldText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 16,
    minHeight: 80,
  },
  reasonInput: {
    color: '#111827',
    fontSize: 13,
    textAlign: 'center',
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
    backgroundColor: '#991b1b', // Dark red as shown in image
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
