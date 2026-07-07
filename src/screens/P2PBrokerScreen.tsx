import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Modal, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface MerchantMatch {
  alias: string;
  rate: number;
  orders: number;
  completion: number;
  minLimit: number;
  maxLimit: number;
  paymentMethod: string;
  releaseTime: number;
}

export default function P2PBrokerScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<MerchantMatch | null>(null);
  const trustPoints = useWalletStore((state) => state.trustPoints);
  const wallets = useWalletStore((state) => state.wallets);
  const activeWalletId = useWalletStore((state) => state.activeWalletId);
  const activeWallet = wallets.find(w => w.id === activeWalletId);

  useEffect(() => {
    if (activeWallet?.name.toLowerCase().includes('burner')) {
      Alert.alert('Security Restricted', 'Burner addresses are not permitted for direct P2P trading.');
      navigation.goBack();
    }
  }, [activeWallet, navigation]);

  const [showInfo, setShowInfo] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null);
  const [amount, setAmount] = useState('');
  
  // Terms agreement state
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [termsAgreedCheckbox, setTermsAgreedCheckbox] = useState(false);
  const [pendingAction, setPendingAction] = useState<'buy' | 'sell' | null>(null);

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };
  
  const [showAptosModal, setShowAptosModal] = useState(false);
  const [aptosStep, setAptosStep] = useState<'linking' | 'locking' | 'locked' | 'insufficient'>('linking');
  const aptosBalance = 0; // Mock 0 to show insufficient by default, or change to 100 to show lock. Let's make it 100 for success, wait I will make it 0 and then we can change it to test if we want, actually let's set a mock balance of 500 so it locks it. Wait, the user said "if they don't have it... if they have it...". Let's use 500.
  const mockAptosBalance = 500;

  const handleSellAction = () => {
    setShowAptosModal(true);
    setAptosStep('linking');
    setTimeout(() => {
      if (mockAptosBalance > 0) {
        setAptosStep('locking');
        setTimeout(() => {
          setAptosStep('locked');
        }, 2000);
      } else {
        setAptosStep('insufficient');
      }
    }, 2000);
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
    setTradeType(action);
    setMatch(null);
    if (action === 'sell') {
      handleSellAction();
    }
  };

  const confirmTerms = () => {
    setHasAgreedTerms(true);
    setShowTermsModal(false);
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setMatch(null);

    // Mock match search response
    setTimeout(() => {
      setLoading(false);
      setMatch({
        alias: 'DeltaSettle',
        rate: 1510.00,
        orders: 220,
        completion: 100.0,
        minLimit: 200.0,
        maxLimit: 10000.0,
        paymentMethod: 'Bank Transfer',
        releaseTime: 1.5
      });
    }, 1000);
  };

  const handleMatch = () => {
    if (!match) return;
    if (trustPoints < 50) {
      Alert.alert('Lockdown Warning', 'Low trust score blocks active broker execution.');
      return;
    }

    const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);
    navigation.replace('OrderActive', {
      orderId,
      merchantName: match.alias,
      amount: 500.00,
      fiatAmount: 500.00 * match.rate,
      rate: match.rate,
      paymentMethod: match.paymentMethod
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>P2P Broker Matchmaker</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.iconBtn}>
          <Ionicons name="information-circle-outline" size={24} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      <Text style={styles.introText}>
        Enter what you want in simple terms. CloudVoid's AI will parse your query and match you with verified liquidity brokers instantly.
      </Text>

      {/* Buy/Sell Toggles */}
      <View style={styles.tradeTypeContainer}>
        <TouchableOpacity 
          style={[styles.tradeBtn, tradeType === 'buy' && styles.glowBuy]} 
          onPress={() => handleActionRequest('buy')}
        >
          <Text style={[styles.tradeBtnText, tradeType === 'buy' && styles.glowTextBuy]}>Buy USDT</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tradeBtn, tradeType === 'sell' && styles.glowSell]} 
          onPress={() => handleActionRequest('sell')}
        >
          <Text style={[styles.tradeBtnText, tradeType === 'sell' && styles.glowTextSell]}>Sell USDT</Text>
        </TouchableOpacity>
      </View>

      {tradeType === 'buy' && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter USDT amount you want to buy..."
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            autoFocus
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            {loading ? (
              <ActivityIndicator size="small" color={CloudVoidTheme.colors.textPrimary} />
            ) : (
              <Ionicons name="search" size={20} color={CloudVoidTheme.colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Matching result card */}
      {match && (
        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <View>
              <Text style={styles.matchTag}>🏆 AI Best Match</Text>
              <Text style={styles.merchantName}>{match.alias}</Text>
            </View>
            <Text style={styles.rate}>₦{match.rate}/USDT</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>{match.orders} trades</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>{match.completion}% completions</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>⚡ {match.releaseTime}m release</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Limits:</Text>
              <Text style={styles.detailVal}>₦{(match.minLimit * match.rate).toLocaleString()} - ₦{(match.maxLimit * match.rate).toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailVal}>{match.paymentMethod}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleMatch}>
            <Text style={styles.confirmBtnText}>Match Trade</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Help Block */}
      {!match && !loading && !tradeType && (
        <View style={styles.helpBlock}>
          <Text style={styles.helpTitle}>Getting Started</Text>
          <Text style={styles.helpItem}>💡 Select "Buy USDT" to enter an amount and find a matching seller.</Text>
          <Text style={styles.helpItem}>💡 Select "Sell USDT" to automatically link your Aptos wallet and move funds to escrow for selling.</Text>
        </View>
      )}

      {/* Info Modal */}
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

      {/* AI Aptos Modal */}
      <Modal visible={showAptosModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.aiModalContent}>
            <Ionicons name="sparkles" size={32} color="#a78bfa" style={{marginBottom: 16}} />
            
            {aptosStep === 'linking' && (
              <>
                <Text style={styles.aiModalTitle}>AI Broker Agent</Text>
                <Text style={styles.aiModalText}>Linking your Aptos wallet to check USDT balance...</Text>
                <ActivityIndicator size="large" color="#a78bfa" style={{marginTop: 20}} />
              </>
            )}
            
            {aptosStep === 'insufficient' && (
              <>
                <Text style={styles.aiModalTitle}>Insufficient Funds</Text>
                <Text style={styles.aiModalText}>You do not have enough Aptos USDT in your current wallet to initiate a sell order.</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => {setShowAptosModal(false); setTradeType(null);}}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}

            {aptosStep === 'locking' && (
              <>
                <Text style={styles.aiModalTitle}>Wallet Linked</Text>
                <Text style={styles.aiModalText}>Found {mockAptosBalance} USDT. Locking down wallet and moving funds to secure P2P escrow...</Text>
                <ActivityIndicator size="large" color="#10b981" style={{marginTop: 20}} />
              </>
            )}

            {aptosStep === 'locked' && (
              <>
                <Ionicons name="lock-closed" size={48} color="#10b981" style={{marginBottom: 16}} />
                <Text style={[styles.aiModalTitle, {color: '#10b981'}]}>Funds Secured</Text>
                <Text style={styles.aiModalText}>Your USDT is now locked in escrow. You are ready to receive fiat offers.</Text>
                <TouchableOpacity style={[styles.modalCloseBtn, {backgroundColor: '#10b981'}]} onPress={() => {setShowAptosModal(false); setTradeType(null);}}>
                  <Text style={styles.modalCloseText}>View Offers</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  introText: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    height: 52,
    paddingLeft: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  searchInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  searchBtn: {
    width: 52,
    height: 52,
    backgroundColor: CloudVoidTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 20,
    padding: 20,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  matchTag: {
    fontSize: 11,
    fontWeight: '700',
    color: CloudVoidTheme.colors.accentGlow,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  rate: {
    fontSize: 20,
    fontWeight: '700',
    color: CloudVoidTheme.colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  statText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: CloudVoidTheme.colors.border,
    marginBottom: 16,
  },
  details: {
    gap: 10,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
  },
  confirmBtn: {
    backgroundColor: '#00b660',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontWeight: '700',
    fontSize: 15,
  },
  helpBlock: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    padding: 16,
    gap: 12,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
  },
  helpItem: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 20,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    justifyContent: 'center',
  },
  tradeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
  },
  tradeBtnText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '700',
  },
  glowBuy: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  glowSell: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  glowTextBuy: {
    color: '#10b981',
  },
  glowTextSell: {
    color: '#ef4444',
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
  aiModalContent: {
    backgroundColor: '#1c1c24',
    borderRadius: 24,
    padding: 32,
    margin: 24,
    alignItems: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
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
  aiModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 22,
    marginBottom: 12,
  },
  aiModalText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 22,
    textAlign: 'center',
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
});
