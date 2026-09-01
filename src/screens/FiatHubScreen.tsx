import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function FiatHubScreen({ navigation }: any) {
  const [activeMode, setActiveMode] = useState<'fiat' | 'p2p'>('fiat');
  const [conversationalQuery, setConversationalQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedMerchant, setMatchedMerchant] = useState<MerchantMatch | null>(null);
  
  const userId = useWalletStore((state) => state.userId);
  const trustPoints = useWalletStore((state) => state.trustPoints);
  const theme = useWalletStore((state) => state.theme);
  const isVerified = useWalletStore((state) => state.isVerified);
  const wallets = useWalletStore((state) => state.wallets);
  const activeWalletId = useWalletStore((state) => state.activeWalletId);
  
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const isBurner = activeWallet?.name.toLowerCase().includes('burner');

  const handleComingSoon = () => {
    Alert.alert('Ecosystem Expansion In Progress', 'Join the Waitlist to lock early zero-fee conversion rates. Coming Soon!');
  };

  const unverifiedContainer = {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  } as const;

  const verifyBtn = {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: CloudVoidTheme.colors.btnBg,
  } as const;

  const verifyBtnText = {
    color: CloudVoidTheme.colors.btnText,
    fontWeight: '700',
  } as const;

  const checkBurnerRestriction = (action: () => void) => {
    if (isBurner) {
      Alert.alert('Security Restricted', 'Burner addresses are not permitted for direct P2P trading.');
    } else {
      action();
    }
  };

  const balanceCardColors: [string, string, string] = theme === 'light'
    ? ['#ffffff', '#f3f4f6', '#e5e7eb']
    : ['rgba(25, 25, 35, 1)', 'rgba(35, 35, 50, 1)', 'rgba(25, 25, 45, 1)'];

  const handleP2PSearch = () => {
    if (!conversationalQuery.trim()) return;
    setIsSearching(true);
    setMatchedMerchant(null);

    // Simulate conversational heuristic matchmaker
    setTimeout(() => {
      setIsSearching(false);
      setMatchedMerchant({
        alias: 'AlphaBroker_7',
        rate: 1505.00,
        orders: 245,
        completion: 99.8,
        minLimit: 50.00,
        maxLimit: 1000.00,
        paymentMethod: conversationalQuery.toLowerCase().includes('orange') ? 'Orange Money' : 'Bank Transfer',
        releaseTime: 1.2
      });
    }, 1200);
  };

  const handleCreateOrder = (merchant: MerchantMatch) => {
    if (trustPoints < 50) {
      Alert.alert('Lockdown Zone', 'Trade denied. Your trust points score is too low (< 50).');
      return;
    }
    
    // Simulate matched order creation and route to OrderActiveScreen
    const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);
    navigation.navigate('OrderActive', { 
      orderId, 
      merchantName: merchant.alias,
      amount: 100.00,
      fiatAmount: 100.00 * merchant.rate,
      rate: merchant.rate,
      paymentMethod: merchant.paymentMethod
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={CloudVoidTheme.colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Selector Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'fiat' ? styles.activeToggleBtn : null]}
            onPress={() => setActiveMode('fiat')}
          >
            <Text style={[styles.toggleText, activeMode === 'fiat' ? styles.activeToggleText : null]}>
              Fiat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'p2p' ? styles.activeToggleBtn : null]}
            onPress={() => setActiveMode('p2p')}
          >
            <Text style={[styles.toggleText, activeMode === 'p2p' ? styles.activeToggleText : null]}>
              P2P
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={activeMode === 'fiat'} // Disable scroll when P2P overlay is active
      >
        <View style={[styles.fiatView, activeMode === 'p2p' && { opacity: 0.3 }]} pointerEvents={activeMode === 'p2p' ? 'none' : 'auto'}>
          {/* Total Balance Card */}
          <LinearGradient
            colors={balanceCardColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalBalanceCard}
          >
            <Text style={styles.totalBalanceLabel}>Total Fiat Value</Text>
            <Text style={styles.totalBalanceValue}>₦1,250,450.00</Text>
            <Text style={styles.totalBalanceSub}>($1,250.45 USD equivalent)</Text>
          </LinearGradient>

          {/* Your Accounts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Accounts</Text>
            
            <View style={styles.accountCard}>
              <View style={styles.accountCardLeft}>
                <Text style={styles.flagIcon}>🇺🇸</Text>
                <View>
                  <Text style={styles.accountCode}>USD</Text>
                  <Text style={styles.accountName}>CloudVoid USD</Text>
                </View>
              </View>
              <View style={styles.accountCardRight}>
                <Text style={styles.accountBalance}>$950.00</Text>
                <View style={{flexDirection: 'row', gap: 6}}>
                  <TouchableOpacity style={[styles.topupBtn, { backgroundColor: CloudVoidTheme.colors.btnBg }]} onPress={handleComingSoon}>
                    <Text style={styles.topupBtnText}>Convert</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.topupBtn, { backgroundColor: '#3b82f6' }]} onPress={handleComingSoon}>
                    <Text style={styles.topupBtnText}>Top-up USD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.accountCard}>
              <View style={styles.accountCardLeft}>
                <Text style={styles.flagIcon}>🇳🇬</Text>
                <View>
                  <Text style={styles.accountCode}>NGN</Text>
                  <Text style={styles.accountName}>CloudVoid NGN</Text>
                </View>
              </View>
              <View style={styles.accountCardRight}>
                <Text style={styles.accountBalance}>₦250,000.00</Text>
                <View style={{flexDirection: 'row', gap: 6}}>
                  <TouchableOpacity style={[styles.topupBtn, { backgroundColor: CloudVoidTheme.colors.btnBg }]} onPress={handleComingSoon}>
                    <Text style={styles.topupBtnText}>Convert</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.topupBtn, { backgroundColor: '#22c55e' }]} onPress={handleComingSoon}>
                    <Text style={styles.topupBtnText}>Top-up NGN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Your Cards Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Cards</Text>
            
            <View style={styles.virtualCard}>
              <View style={styles.virtualCardTop}>
                <View style={styles.virtualCardLeft}>
                  <Text style={styles.visaLogo}>VISA</Text>
                  <View>
                    <Text style={styles.virtualCardName}>Virtual Visa Card</Text>
                    <Text style={styles.virtualCardNumber}>**** 5678</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.manageCardBtn}
                  onPress={handleComingSoon}
                >
                  <Text style={styles.manageCardText}>Manage Card</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.activeStatus}>Active</Text>
            </View>

            <TouchableOpacity 
              style={styles.issueCardBtn}
              onPress={handleComingSoon}
            >
              <Text style={styles.issueCardText}>Issue New Card</Text>
            </TouchableOpacity>
          </View>

          {/* Fiat Transactions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fiat Transactions</Text>
              <TouchableOpacity onPress={handleComingSoon}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.txIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Text style={styles.txIconSymbol}>₦</Text>
                </View>
                <View>
                  <Text style={[styles.txAmount, { color: '#ef4444' }]}>-₦50,000</Text>
                  <Text style={styles.txType}>OPay</Text>
                </View>
              </View>
            </View>

            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.txIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                  <Text style={styles.txIconSymbol}>₦</Text>
                </View>
                <View>
                  <Text style={[styles.txAmount, { color: '#22c55e' }]}>+₦100,000</Text>
                  <Text style={styles.txType}>Bank Transfer</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* P2P Overlay */}
      {activeMode === 'p2p' && (
        <View style={styles.p2pOverlay} pointerEvents="box-none">

          {/* Bottom Action Sheet */}
          <View style={styles.p2pBottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>P2P Marketplace Actions</Text>
            
            <TouchableOpacity 
              style={styles.p2pActionItem}
              onPress={() => checkBurnerRestriction(() => navigation.navigate('MerchantFinder'))}
            >
              <View style={styles.p2pActionLeft}>
                <Ionicons name="chatbubbles" size={20} color="#38bdf8" />
                <Text style={styles.p2pActionText}>AI Chat Broker</Text>
              </View>
              <Ionicons name="sparkles" size={16} color="#c084fc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.p2pActionItem}
              onPress={() => navigation.navigate('UserAccountDashboard')}
            >
              <View style={styles.p2pActionLeft}>
                <Ionicons name="person" size={20} color="#60a5fa" />
                <Text style={styles.p2pActionText}>User Dashboard</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.p2pActionItem}
              onPress={() => navigation.navigate('MerchantDashboard')}
            >
              <View style={styles.p2pActionLeft}>
                <Ionicons name="storefront" size={20} color="#f43f5e" />
                <Text style={styles.p2pActionText}>Merchant Dashboard</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.p2pActionItem}
              onPress={() => checkBurnerRestriction(() => navigation.navigate('MerchantOnboarding'))}
            >
              <View style={styles.p2pActionLeft}>
                <Ionicons name="megaphone" size={20} color="#fb923c" />
                <Text style={styles.p2pActionText}>Become a Merchant</Text>
              </View>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>Pro</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 15,
    marginLeft: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    padding: 2,
    borderRadius: CloudVoidTheme.radii.pill,
    width: 160,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: CloudVoidTheme.radii.pill,
  },
  activeToggleBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textSecondary,
  },
  activeToggleText: {
    color: CloudVoidTheme.colors.btnText,
  },
  headerRightPlaceholder: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  fiatView: {
    gap: 24,
  },
  
  // Total Balance Card
  totalBalanceCard: {
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  totalBalanceLabel: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  totalBalanceValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
  },
  totalBalanceSub: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
  },
  unverifiedTitle: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  unverifiedSub: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  verifyBtn: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  verifyBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 14,
    fontWeight: '700',
  },

  // Sections
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '500',
  },

  // Accounts
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagIcon: {
    fontSize: 24,
  },
  accountCode: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  accountName: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 11,
  },
  accountCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  accountBalance: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  topupBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  topupBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 10,
    fontWeight: '700',
  },

  // Cards
  virtualCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  virtualCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  virtualCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visaLogo: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  virtualCardName: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  virtualCardNumber: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
  },
  manageCardBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  manageCardText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '600',
  },
  activeStatus: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  issueCardBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  issueCardText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 14,
    fontWeight: '600',
  },

  // Transactions
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  txType: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
  },

  // P2P Overlay Styles
  p2pOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  floatingButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 300, // adjust to sit right above the bottom sheet
    alignItems: 'center',
  },
  floatingAIBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#c084fc',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  floatingAIGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAIText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  p2pBottomSheet: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated, // dark slate background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 110, // enough padding for tab bar
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  p2pActionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  p2pActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  p2pActionText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  proBadge: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 10,
    fontWeight: '700',
  },
});
