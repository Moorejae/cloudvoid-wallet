import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function IssueCardScreen({ navigation }: any) {
  const [cardName, setCardName] = useState('');

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
        <Text style={styles.headerTitle}>Issue New Card</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Graphic (scaled-down) */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#1e3a5f', '#102a45', '#0f172a']} // slight dark blue gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGraphic}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.brandText}>
                <Text style={{ fontWeight: '800' }}>CLOUD</Text>VOID
              </Text>
              <View style={styles.cardTypeContainer}>
                <Ionicons name="cloud-outline" size={24} color={CloudVoidTheme.colors.textPrimary} />
                <Text style={styles.cardTypeText}>DEBIT</Text>
              </View>
            </View>

            <LinearGradient colors={['#d1d5db', '#9ca3af']} style={styles.chip}>
              <View style={styles.chipLine1} />
              <View style={styles.chipLine2} />
              <View style={styles.chipLine3} />
            </LinearGradient>

            <Text style={styles.cardNumber}>****  ****  ****</Text>

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardHolder}>M. Thompson</Text>
              </View>
              <View style={styles.mastercardLogo}>
                <View style={[styles.mcCircle, { backgroundColor: '#eb001b', left: 10 }]} />
                <View style={[styles.mcCircle, { backgroundColor: '#f79e1b', opacity: 0.8 }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Integrated Card Name & Fee Control */}
        <View style={styles.controlCard}>
          {/* Pill-Shaped Input */}
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.cardNameInput}
              value={cardName}
              onChangeText={setCardName}
              placeholder="Card Name (e.g., Shopping Card, Family Card)"
              placeholderTextColor="#6b7280"
            />
            <Ionicons name="diamond" size={20} color="#a78bfa" style={styles.inputIcon} />
          </View>
          
          {/* Pill Bar configuration state */}
          <LinearGradient 
            colors={['#8b5cf6', '#3b82f6', 'transparent']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={styles.stateBar} 
          />

          {/* Fee Section */}
          <View style={styles.feeSection}>
            <Text style={styles.feeLabel}>Issue New Card Fee</Text>
            <Text style={styles.feeAmount}>$5.00</Text>
          </View>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>AI has configured these details based on your profile.</Text>
        <TouchableOpacity style={styles.createBtn}>
          <Text style={styles.createBtnText}>Create Card</Text>
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
  cardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    marginBottom: 24,
  },
  cardGraphic: {
    width: '100%',
    height: 190, // Slightly scaled down feeling
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandText: { color: CloudVoidTheme.colors.textPrimary, fontSize: 16, letterSpacing: 1 },
  cardTypeContainer: { alignItems: 'center' },
  cardTypeText: { color: CloudVoidTheme.colors.textPrimary, fontSize: 8, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
  chip: { width: 40, height: 28, borderRadius: 6, justifyContent: 'space-evenly', paddingVertical: 4 },
  chipLine1: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  chipLine2: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  chipLine3: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  cardNumber: {
    color: CloudVoidTheme.colors.textPrimary, fontSize: 22, fontWeight: '500', letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardHolder: { color: CloudVoidTheme.colors.textPrimary, fontSize: 14, fontWeight: '500' },
  mastercardLogo: { flexDirection: 'row', alignItems: 'center', width: 48, height: 30, justifyContent: 'center' },
  mcCircle: { width: 30, height: 30, borderRadius: 15, position: 'absolute' },
  
  controlCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // translucent dark slate
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 24, // Pill shape
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  cardNameInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
  },
  inputIcon: {
    marginLeft: 8,
  },
  stateBar: {
    height: 4,
    width: '60%',
    borderRadius: 2,
    marginBottom: 24,
    opacity: 0.8,
  },
  feeSection: {
    gap: 4,
  },
  feeLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  feeAmount: {
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
  createBtn: {
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
  createBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
