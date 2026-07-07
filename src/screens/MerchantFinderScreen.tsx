import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function MerchantFinderScreen({ navigation }: any) {
  const [inputText, setInputText] = useState('');
  
  const [showInfo, setShowInfo] = useState(false);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [termsAgreedCheckbox, setTermsAgreedCheckbox] = useState(false);
  const [pendingAction, setPendingAction] = useState<'buy' | 'sell' | null>(null);

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const handleActionRequest = (action: 'buy' | 'sell') => {
    if (!hasAgreedTerms) {
      setPendingAction(action);
      setShowTermsModal(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action: 'buy' | 'sell') => {
    // Action confirmed logic can be placed here
  };

  const confirmTerms = () => {
    setHasAgreedTerms(true);
    setShowTermsModal(false);
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Finder</Text>
        <TouchableOpacity style={styles.headerBtnRight} onPress={() => setShowInfo(true)}>
          <Ionicons name="information-circle-outline" size={24} color="#a78bfa" />
          <Text style={styles.infoText}>Info</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* AI Interaction Sequence */}
        <View style={styles.aiInteractionContainer}>
          
          <View style={styles.chatRow}>
            <Ionicons name="sparkles" size={18} color="#c084fc" style={styles.chatIcon} />
            <Text style={styles.chatText}>Welcome! Would you like to buy or sell USDT today?</Text>
          </View>
          
          <View style={styles.chatOptions}>
            <TouchableOpacity 
              style={[styles.chatBtn, { backgroundColor: '#22c55e' }]}
              onPress={() => handleActionRequest('buy')}
            >
              <Text style={styles.chatBtnText}>Buy USDT</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chatBtn, { backgroundColor: CloudVoidTheme.colors.btnBg }]}
              onPress={() => handleActionRequest('sell')}
            >
              <Text style={styles.chatBtnText}>Sell USDT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chatRow}>
            <View style={{width: 18, marginRight: 8}} />
            <Text style={styles.chatText}>Great. Please enter the NGN amount you wish to buy.</Text>
          </View>

          <View style={styles.chatInputWrapper}>
            <TextInput 
              style={styles.chatInputBox}
              placeholder="e.g., 50,000 NGN"
              placeholderTextColor="#6b7280"
              editable={false}
            />
          </View>

          <View style={styles.chatRow}>
            <Ionicons name="sparkles" size={18} color="#c084fc" style={styles.chatIcon} />
            <Text style={styles.chatText}>Searching active merchants...</Text>
            <View style={styles.loadingBar}>
              <View style={styles.loadingBarFill} />
            </View>
          </View>

        </View>

        {/* Merchant Card */}
        <View style={styles.merchantCard}>
          <View style={styles.merchantCardHeader}>
            <View style={styles.usdtHeaderLeft}>
              <View style={styles.usdtIconWrapper}>
                <Text style={styles.usdtIcon}>₮</Text>
              </View>
              <Text style={styles.usdtTitle}>USDT</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price per unit</Text>
              <Text style={styles.priceValue}>₦1,379.99</Text>
            </View>
          </View>

          <View style={styles.merchantDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>seller →</Text>
              <Text style={styles.detailValue}>Ayofemi</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order quantity →</Text>
              <Text style={styles.detailValue}>226 Order(s)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completion rate →</Text>
              <Text style={styles.detailValue}>100%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Limits →</Text>
              <Text style={styles.detailValue}>4,500.00 - 50,000.00 NGN</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Duration →</Text>
              <Text style={styles.detailValue}>15 Min(s)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment method →</Text>
              <View style={styles.paymentMethodsRow}>
                <View style={[styles.methodTag, { backgroundColor: '#f97316' }]}>
                  <Text style={styles.methodTagText}>+ Opay</Text>
                </View>
                <View style={[styles.methodTag, { backgroundColor: '#22c55e' }]}>
                  <Text style={styles.methodTagText}>+ Bank Transfer</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.whyRecommend}>
            <Text style={styles.whyTitle}>Why recommend</Text>
            <Text style={styles.whyText}>
              "Supports Opay and Bank Transfer, is online, and has a perfect completion rate. Ideal for small purchases.
              Drawback: Maximum amount is limited to ₦50,000 per transaction."
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.buyUsdtBtn}
              onPress={() => navigation.navigate('ActiveTradeChat')}
            >
              <Text style={styles.buyUsdtBtnText}>Buy USDT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextMerchantBtn}>
              <Text style={styles.nextMerchantBtnText}>Next Merchant {'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.aiSearchNote}>
          AI will search for another merchant based on your criteria.
        </Text>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Due Diligence Info Modal */}
      <Modal visible={showInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={28} color="#a78bfa" />
              <Text style={styles.modalTitle}>P2P Due Diligence</Text>
            </View>
            <Text style={styles.modalText}>• <Text style={{fontWeight:'700', color: CloudVoidTheme.colors.textPrimary}}>Never release assets</Text> before verifying payment in your actual bank account (do not rely on SMS).</Text>
            <Text style={styles.modalText}>• <Text style={{fontWeight:'700', color: CloudVoidTheme.colors.textPrimary}}>Do not communicate</Text> or transact outside the CloudVoid platform.</Text>
            <Text style={styles.modalText}>• <Text style={{fontWeight:'700', color: CloudVoidTheme.colors.textPrimary}}>Beware of impersonators.</Text> CloudVoid support will never ask you to release funds manually or ask for your seed phrase.</Text>
            <Text style={styles.modalText}>• If there is an issue, open a dispute immediately to invoke the Jury system.</Text>
            
            <View style={{marginTop: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12}}>
               <Text style={[styles.modalText, {marginBottom: 4, fontWeight: '600'}]}>Legal Disclaimer</Text>
               <Text style={[styles.modalText, {fontSize: 12, color: '#9ca3af', marginBottom: 0}]}>CloudVoid acts purely as a non-custodial matching and escrow technology layer. CloudVoid holds no assets and accepts no liability for fiat losses, bank freezes, or off-platform communication. By trading here, both buyers and sellers agree to our P2P Terms of Service and Code of Conduct.</Text>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowInfo(false)}>
              <Text style={styles.modalCloseText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mandatory Terms Agreement Modal */}
      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="document-text" size={28} color="#10b981" />
              <Text style={styles.modalTitle}>User Agreement Required</Text>
            </View>
            <Text style={[styles.modalText, { marginBottom: 10 }]}>Before you can access the P2P Matchmaker, you must read and acknowledge the following terms:</Text>
            
            <ScrollView 
              style={styles.termsScrollBox}
              onScroll={({nativeEvent}) => {
                if (isCloseToBottom(nativeEvent)) {
                  setHasScrolledToBottom(true);
                }
              }}
              scrollEventThrottle={400}
            >
              <Text style={styles.termsHeading}>1. No Platform Liability</Text>
              <Text style={styles.termsText}>CloudVoid acts purely as a non-custodial technology layer. We do not hold any assets (fiat or crypto). CloudVoid is not liable for counterparty fraud, fiat bank freezes, chargebacks, or any off-platform communication. You trade entirely at your own risk.</Text>
              
              <Text style={styles.termsHeading}>2. Dispute Protocol & The Jury</Text>
              <Text style={styles.termsText}>All P2P disputes are settled exclusively via the decentralized CloudVoid Jury System. The platform relies on the Jury to securely resolve conflicts and release funds held in the multisig escrow. You must cooperate fully with arbitration requests.</Text>
              
              <Text style={styles.termsHeading}>3. Platform Bans</Text>
              <Text style={styles.termsText}>While CloudVoid cannot confiscate or freeze your crypto assets, violating the Code of Conduct or Terms of Service will result in an immediate and permanent account ban. Your identity will be flagged, preventing any future verification on the platform.</Text>
              
              <Text style={styles.termsHeading}>4. Off-Platform Trading</Text>
              <Text style={styles.termsText}>All trade-related communication must occur within the official CloudVoid P2P chat. Redirecting users to external channels (e.g., WhatsApp, Telegram) is strictly forbidden and is grounds for immediate account revocation.</Text>
              
              <Text style={styles.termsHeading}>5. Third-Party Payments</Text>
              <Text style={styles.termsText}>You must use payment accounts that match your verified platform identity. Accepting or sending payments via third-party accounts is a severe violation of the Code of Conduct.</Text>
              
              {!hasScrolledToBottom && (
                <Text style={styles.scrollPrompt}>Scroll to the bottom to continue ↓</Text>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.checkboxRow, { opacity: hasScrolledToBottom ? 1 : 0.5 }]} 
              disabled={!hasScrolledToBottom}
              onPress={() => setTermsAgreedCheckbox(!termsAgreedCheckbox)}
            >
              <View style={[styles.checkbox, termsAgreedCheckbox && styles.checkboxActive]}>
                {termsAgreedCheckbox && <Ionicons name="checkmark" size={14} color={CloudVoidTheme.colors.textPrimary} />}
              </View>
              <Text style={styles.agreementText}>
                I have read and agree to the CloudVoid P2P Code of Conduct and Terms of Service.
              </Text>
            </TouchableOpacity>
            
            <View style={{flexDirection: 'row', gap: 12}}>
              <TouchableOpacity style={[styles.modalCloseBtn, {flex: 1, backgroundColor: 'rgba(255,255,255,0.1)'}]} onPress={() => setShowTermsModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalCloseBtn, {flex: 1, backgroundColor: termsAgreedCheckbox ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}]} 
                onPress={confirmTerms}
                disabled={!termsAgreedCheckbox}
              >
                <Text style={styles.modalCloseText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gemini-Style Bottom Input Bar */}
      <View style={styles.bottomInputContainer}>
        <TouchableOpacity style={styles.plusBtn}>
          <Ionicons name="add" size={24} color={CloudVoidTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput 
            style={styles.textInput}
            placeholder="Search merchants or ask AI..."
            placeholderTextColor="#6b7280"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
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
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
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
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  infoText: {
    color: '#a78bfa',
    fontSize: 10,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  aiInteractionContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  chatText: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  chatOptions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 26,
    marginBottom: 16,
  },
  chatBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  chatInputWrapper: {
    marginLeft: 26,
    marginBottom: 16,
  },
  chatInputBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
  },
  loadingBar: {
    height: 6,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginLeft: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    width: '50%',
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 3,
  },
  merchantCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  merchantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usdtHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usdtIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#26a17b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  usdtIcon: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  usdtTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: '#9ca3af',
    fontSize: 11,
  },
  priceValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  merchantDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  detailValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodTagText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  whyRecommend: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  whyTitle: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  whyText: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  buyUsdtBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  buyUsdtBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  nextMerchantBtn: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextMerchantBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  aiSearchNote: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
  spacer: {
    flex: 1,
    minHeight: 100,
  },
  bottomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30, // Safe area for newer iPhones
    backgroundColor: '#12121a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sendBtn: {
    padding: 10,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
    paddingHorizontal: 8,
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
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  agreementText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
  },
  termsScrollBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexShrink: 1,
  },
  termsHeading: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 12,
  },
  termsText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
  },
  scrollPrompt: {
    color: '#8b5cf6',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  textInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
  },
  micBtn: {
    paddingLeft: 8,
  },
});
