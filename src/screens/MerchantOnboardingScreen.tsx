import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function MerchantOnboardingScreen({ navigation }: any) {
  const [alias, setAlias] = useState('');
  const [businessName, setBusinessName] = useState('CryptcHub Enterprises');
  const [email, setEmail] = useState('contact@cryptohub.ng');
  const [agreed, setAgreed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Simulated backend check for requirements
  const requirementsMet = true;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Onboarding</Text>
        <TouchableOpacity style={styles.headerBtnRight} onPress={() => setShowInfo(true)}>
          <Ionicons name="information-circle-outline" size={24} color="#a78bfa" />
          <Text style={styles.infoText}>Info</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Ionicons name="megaphone" size={32} color={CloudVoidTheme.colors.textPrimary} />
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Pro</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Unlock Merchant Status</Text>
          <Text style={styles.heroSub}>
            Accelerate your crypto business with premium tools and exclusive P2P access.
          </Text>

          {/* Requirements */}
          <View style={styles.reqRow}>
            <View style={styles.reqItem}>
              <Ionicons name="storefront-outline" size={20} color="#a78bfa" />
              <View>
                <Text style={styles.reqLabel}>Requirements:</Text>
                <Text style={styles.reqVal}>&gt;= 200 Trades</Text>
              </View>
            </View>
            <View style={styles.reqItem}>
              <Ionicons name="ribbon-outline" size={20} color="#a78bfa" />
              <View>
                <Text style={styles.reqVal}>100%</Text>
                <Text style={styles.reqLabel}>Completion Rate</Text>
              </View>
            </View>
            <View style={styles.reqItem}>
              <Ionicons name="time-outline" size={20} color="#a78bfa" />
              <View>
                <Text style={styles.reqVal}>Avg. Release</Text>
                <Text style={styles.reqLabel}>&lt; 5 mins</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Exclusive Merchant Benefits */}
        <Text style={styles.sectionTitle}>Exclusive Merchant Benefits</Text>
        
        <View style={styles.benefitItem}>
          <Ionicons name="trending-up" size={24} color="#a78bfa" style={styles.benefitIcon} />
          <View style={styles.benefitTextCol}>
            <Text style={styles.benefitTitle}>Priority Trade Matching</Text>
            <Text style={styles.benefitDesc}>Get first access to high-volume buy/sell orders.</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="shield-checkmark" size={24} color="#a78bfa" style={styles.benefitIcon} />
          <View style={styles.benefitTextCol}>
            <Text style={styles.benefitTitle}>Advanced Dispute Protection</Text>
            <Text style={styles.benefitDesc}>Participate in anonymous community jury panels and benefit from streamlined resolutions.</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="options" size={24} color="#a78bfa" style={styles.benefitIcon} />
          <View style={styles.benefitTextCol}>
            <Text style={styles.benefitTitle}>Customizable Fee Structure</Text>
            <Text style={styles.benefitDesc}>Adjust your P2P spread and earn higher margins.</Text>
          </View>
        </View>

        {/* Business Profile Confirmation */}
        <Text style={styles.sectionTitle}>Business Profile Confirmation</Text>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Merchant Alias</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="e.g. CryptoKing" 
              placeholderTextColor="#6b7280"
              value={alias}
              onChangeText={setAlias}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Business Name</Text>
            <TextInput 
              style={styles.textInput} 
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Business Contact Email</Text>
            <TextInput 
              style={styles.textInput} 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Agreement Checkbox */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Ionicons name="checkmark" size={14} color={CloudVoidTheme.colors.textPrimary} />}
          </View>
          <Text style={styles.agreementText}>
            I agree to the CloudVoid Merchant <Text style={styles.linkText} onPress={() => navigation.navigate('LegalDocument', { documentType: 'conduct' })}>Code of Conduct</Text> & <Text style={styles.linkText} onPress={() => navigation.navigate('LegalDocument', { documentType: 'terms' })}>Terms of Service</Text>.
          </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer Area with Submit Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={[
            styles.submitBtn, 
            (!agreed || !requirementsMet) && styles.submitBtnDisabled,
            (agreed && requirementsMet) && styles.glowSubmit
          ]} 
          disabled={!agreed || !requirementsMet}
          onPress={() => navigation.navigate('MerchantDashboard')}
        >
          <Text style={styles.submitBtnText}>Submit Merchant Application</Text>
        </TouchableOpacity>
        <Text style={styles.reviewNotice}>This application is subject to manual review.</Text>
      </View>

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={28} color="#a78bfa" />
              <Text style={styles.modalTitle}>Merchant Due Diligence</Text>
            </View>
            <Text style={styles.modalText}>To unlock and maintain Merchant Status, your account must consistently meet the following minimum requirements:</Text>
            <Text style={styles.modalText}>• <Text style={{fontWeight: '700', color: CloudVoidTheme.colors.textPrimary}}>200+</Text> Successful P2P Trades</Text>
            <Text style={styles.modalText}>• <Text style={{fontWeight: '700', color: CloudVoidTheme.colors.textPrimary}}>100%</Text> Trade Completion Rate</Text>
            <Text style={styles.modalText}>• <Text style={{fontWeight: '700', color: CloudVoidTheme.colors.textPrimary}}>&lt; 5 mins</Text> Average Release Time</Text>
            <Text style={[styles.modalText, {marginTop: 10, color: '#f87171'}]}>Failing to meet these metrics or violating the Code of Conduct will result in immediate revocation of your merchant privileges.</Text>
            
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowInfo(false)}>
              <Text style={styles.modalCloseText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#0b0b0e',
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
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-end',
  },
  infoText: {
    color: '#a78bfa',
    fontSize: 14,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: '#16161e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  heroIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSub: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  reqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  reqItem: {
    alignItems: 'center',
    flex: 1,
  },
  reqLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  reqVal: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingRight: 16,
  },
  benefitIcon: {
    marginRight: 16,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDesc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
  },
  formContainer: {
    backgroundColor: '#16161e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderColor: '#8b5cf6',
  },
  agreementText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: '#a78bfa',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  submitBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  reviewNotice: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#0b0b0e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  glowSubmit: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c1c24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
  },
  modalText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 22,
    marginBottom: 8,
  },
  modalCloseBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  modalCloseText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
