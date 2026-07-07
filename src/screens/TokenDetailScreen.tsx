import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Image, Modal, ActivityIndicator, Platform, TextInput } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import AIBrain from '../components/AIBrain';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

const generateMockBurnerAddress = (symbol: string) => {
  const chars = '0123456789abcdef';
  const sym = symbol.toUpperCase();
  if (sym === 'BTC') {
    const bChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = '1';
    for (let i = 0; i < 33; i++) addr += bChars[Math.floor(Math.random() * bChars.length)];
    return addr;
  } else if (sym === 'SOL') {
    const sChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = '';
    for (let i = 0; i < 44; i++) addr += sChars[Math.floor(Math.random() * sChars.length)];
    return addr;
  } else if (sym === 'TRX') {
    const tChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = 'T';
    for (let i = 0; i < 33; i++) addr += tChars[Math.floor(Math.random() * tChars.length)];
    return addr;
  } else {
    // EVM default
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
    return addr;
  }
};

export default function TokenDetailScreen({ route, navigation }: any) {
  const token = route.params?.token || { symbol: 'BTC', name: 'Bitcoin', price: 64230.00, change: 2.4, icon: '🧡', iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', color: '#f59e0b' };
  const balances = useWalletStore((state) => state.balances);
  const balance = balances[token.symbol] || 0;
  const fiatValue = balance * token.price;
  const isGain = token.change >= 0;

  const wallets = useWalletStore((state) => state.wallets);
  const deleteWallet = useWalletStore((state) => state.deleteWallet);
  const addTransaction = useWalletStore((state) => state.addTransaction);

  const activeBurner = wallets.find(w => w.name === `Burner (${token.symbol})`);

  const [statsExpanded, setStatsExpanded] = useState(true);
  const [isBurnerModalVisible, setIsBurnerModalVisible] = useState(false);
  const [burnerState, setBurnerState] = useState<'idle' | 'generating' | 'success' | 'active' | 'sweeping_setup' | 'sweeping_loading' | 'sweeping_success'>('idle');
  const [generatedAddress, setGeneratedAddress] = useState('');

  const [sweepDestination, setSweepDestination] = useState<'primary' | 'custom'>('primary');
  const [customAddressInput, setCustomAddressInput] = useState('');

  const primaryWallet = wallets.find(w => w.name === 'Main Wallet') || wallets[0];
  const primaryAddress = primaryWallet ? primaryWallet.address : '0x1a2b...3c4d';

  const addWallet = useWalletStore((state) => state.addWallet);

  const handleGenerateBurner = () => {
    setBurnerState('generating');
    setTimeout(() => {
      const addr = generateMockBurnerAddress(token.symbol);
      setGeneratedAddress(addr);
      setBurnerState('success');
      
      // Automatically add it to the user's wallet list
      addWallet({
        id: Math.random().toString(),
        name: `Burner (${token.symbol})`,
        address: addr,
        status: 'Active'
      });
    }, 2000); // 2s simulated loading
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(generatedAddress);
    Alert.alert('Copied', 'Address copied to clipboard!');
  };

  const handleSweep = () => {
    if (sweepDestination === 'custom' && !customAddressInput.trim()) {
      Alert.alert('Error', 'Please enter a valid destination address.');
      return;
    }
    setBurnerState('sweeping_loading');
    setTimeout(() => {
      if (activeBurner) {
        // 1. Delete from wallet list
        deleteWallet(activeBurner.id);
        
        // 2. Add Transaction to history
        addTransaction({
          id: Math.random().toString(),
          type: 'Send',
          token: token.symbol,
          amount: -balance, // sweeps the entire balance
          fiatAmount: -fiatValue,
          status: 'Confirmed',
          counterparty: sweepDestination === 'primary' ? 'Main Wallet' : customAddressInput,
          timestamp: 'Just now'
        });
      }
      setBurnerState('sweeping_success');
    }, 2000);
  };

  const resetBurnerModal = () => {
    setIsBurnerModalVisible(false);
    // Wait for modal animation to close
    setTimeout(() => {
      setBurnerState('idle');
      setGeneratedAddress('');
      setSweepDestination('primary');
      setCustomAddressInput('');
    }, 300);
  };

  const handleAction = (action: string) => {
    if (action === 'Send') {
      navigation.navigate('Send', { token });
    } else if (action === 'Receive') {
      navigation.navigate('Receive', { token });
    } else if (action === 'Scan') {
      navigation.navigate('QRModal', { token, mode: 'scan' });
    } else if (action === 'MyQR') {
      navigation.navigate('QRModal', { token, mode: 'qr' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Image source={{ uri: token.iconUrl }} style={styles.titleLogo} />
          <Text style={styles.topBarTitle}>{token.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('FiatOnRamp', { token })} style={styles.buyBtnHeader}>
            <Ionicons name="card-outline" size={18} color={CloudVoidTheme.colors.success} />
            <Text style={styles.buyText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Swap')} style={styles.swapBtnHeader}>
            <Ionicons name="swap-horizontal" size={18} color="#f59e0b" />
            <Text style={styles.swapText}>Swap</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Token Balance Indicator */}
        <View style={styles.tokenMeta}>
          <Text style={styles.balance}>{balance.toFixed(3)} {token.symbol}</Text>
          <Text style={styles.fiatBalance}>
            ${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Inline Price */}
        <View style={styles.inlinePriceContainer}>
          <Text style={styles.inlinePriceText}>
            ${token.price.toLocaleString()}
          </Text>
          <Text style={[styles.inlinePriceChange, { color: isGain ? CloudVoidTheme.colors.success : CloudVoidTheme.colors.danger }]}>
            {isGain ? '↗' : '↘'} {isGain ? '+' : ''}{token.change}%
          </Text>
        </View>

        {/* 4 Icon Action Buttons Grid */}
        <View style={styles.actionsGrid}>
          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleAction('Send')}
            >
              <Ionicons name="arrow-forward-outline" size={24} color="#f59e0b" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Send</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleAction('Receive')}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#8b5cf6" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Receive</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleAction('Scan')}
            >
              <Ionicons name="scan-outline" size={24} color="#8b5cf6" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Scan</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleAction('MyQR')}
            >
              <Ionicons name="grid-outline" size={24} color="#8b5cf6" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>My QR</Text>
          </View>
        </View>

        {/* Expandable Stats Block */}
        <View style={styles.statsCard}>
          <TouchableOpacity 
            style={styles.statsHeader}
            onPress={() => setStatsExpanded(!statsExpanded)}
          >
            <Text style={styles.statsTitle}>Network & Stats</Text>
            <Ionicons 
              name={statsExpanded ? "close" : "chevron-down"} 
              size={18} 
              color={CloudVoidTheme.colors.textSecondary} 
            />
          </TouchableOpacity>

          {statsExpanded && (
            <View style={styles.statsBody}>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Market Capitalization</Text>
                <Text style={styles.statsValue}>$1.2T</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>24 Hour Transaction Volume</Text>
                <Text style={styles.statsValue}>$32B</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Blockchain Type</Text>
                <Text style={styles.statsValue}>EVM / Native</Text>
              </View>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.linkRow}
                onPress={() => Linking.openURL('https://explorer.aptoslabs.com')}
              >
                <Text style={styles.statsLabel}>Explorer Link</Text>
                <View style={styles.linkGroup}>
                  <Text style={styles.linkText}>View on Scan </Text>
                  <Ionicons name="open-outline" size={14} color={CloudVoidTheme.colors.accentGlow} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Burner Address */}
        <TouchableOpacity 
          style={styles.burnerBtn}
          onPress={() => {
            if (activeBurner) {
              setGeneratedAddress(activeBurner.address);
              setBurnerState('active');
            } else {
              setBurnerState('idle');
            }
            setIsBurnerModalVisible(true);
          }}
        >
          <Ionicons name="flame-outline" size={16} color="#f59e0b" />
          <Text style={styles.burnerText}>Burner Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Burner Address Bottom Sheet / Modal */}
      <Modal
        visible={isBurnerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={resetBurnerModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackgroundDismiss} 
            activeOpacity={1} 
            onPress={resetBurnerModal}
          />
          <LinearGradient
            colors={['rgba(20, 20, 30, 0.98)', 'rgba(10, 10, 15, 0.98)']}
            style={styles.modalContent}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Burner Wallet</Text>
              <TouchableOpacity onPress={resetBurnerModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={CloudVoidTheme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {burnerState === 'idle' && (
              <View style={styles.modalBody}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.02)']}
                    style={styles.flameIconBg}
                  >
                    <Ionicons name="flame" size={48} color="#f59e0b" />
                  </LinearGradient>
                </View>

                <Text style={styles.burnerDescriptionHeading}>Temporary Privacy Wallet</Text>
                <Text style={styles.burnerDescription}>
                  Generate a disposable wallet on the {token.name} network. Best used for single-use transactions to keep your main dashboard address private.
                </Text>

                <View style={styles.networkBadge}>
                  <Text style={styles.networkLabel}>Active Network:</Text>
                  <Text style={styles.networkValue}>{token.name} Network</Text>
                </View>

                <TouchableOpacity 
                  style={styles.actionButtonPrimary}
                  onPress={handleGenerateBurner}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBtn}
                  >
                    <Ionicons name="flash" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Generate Burner Address</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {burnerState === 'generating' && (
              <View style={styles.modalBody}>
                <View style={styles.spinnerContainer}>
                  <ActivityIndicator size="large" color="#f59e0b" />
                  <Text style={styles.spinnerText}>Generating secure keys...</Text>
                  <Text style={styles.spinnerSubText}>Deriving one-time address on {token.name}</Text>
                </View>
              </View>
            )}

            {burnerState === 'success' && (
              <View style={styles.modalBody}>
                <View style={styles.successIconContainer}>
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.02)']}
                    style={styles.checkIconBg}
                  >
                    <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                  </LinearGradient>
                </View>

                <Text style={styles.burnerSuccessHeading}>Burner Wallet Ready!</Text>
                <Text style={styles.burnerSuccessSub}>
                  This wallet has been successfully registered to your dashboard and is ready to receive funds.
                </Text>

                <View style={styles.addressBox}>
                  <Text style={styles.addressText}>{generatedAddress}</Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtnInline}>
                    <Ionicons name="copy-outline" size={18} color="#a78bfa" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.actionButtonSuccess}
                  onPress={resetBurnerModal}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.actionBtnText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {burnerState === 'active' && (
              <View style={styles.modalBody}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.02)']}
                    style={styles.flameIconBg}
                  >
                    <Ionicons name="flame" size={48} color="#f59e0b" />
                  </LinearGradient>
                </View>

                <Text style={styles.burnerDescriptionHeading}>Active Burner Wallet</Text>
                <Text style={styles.burnerDescription}>
                  You have an active temporary wallet on the {token.name} network. You can copy the address to receive funds or sweep the remaining funds to deactivate it.
                </Text>

                <View style={styles.addressBox}>
                  <Text style={styles.addressText}>{generatedAddress}</Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtnInline}>
                    <Ionicons name="copy-outline" size={18} color="#a78bfa" />
                  </TouchableOpacity>
                </View>

                <View style={styles.activeActionsRow}>
                  <TouchableOpacity 
                    style={[styles.actionButtonSecondary, { flex: 1 }]}
                    onPress={() => setBurnerState('sweeping_setup')}
                  >
                    <LinearGradient
                      colors={['#ef4444', '#dc2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Sweep & Close</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButtonSecondary, { flex: 1, marginLeft: 12 }]}
                    onPress={resetBurnerModal}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientBtn}
                    >
                      <Text style={styles.actionBtnText}>Keep Active</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {burnerState === 'sweeping_setup' && (
              <View style={styles.modalBody}>
                <Text style={styles.burnerDescriptionHeading}>Sweep Wallet Funds</Text>
                <Text style={styles.burnerDescription}>
                  Select where you want to transfer all remaining funds from this burner wallet. This will empty the wallet and destroy its keys.
                </Text>

                {/* Sweep Options */}
                <View style={styles.sweepOptionsContainer}>
                  <TouchableOpacity 
                    style={[styles.sweepOptionCard, sweepDestination === 'primary' && styles.sweepOptionCardActive]}
                    onPress={() => setSweepDestination('primary')}
                  >
                    <View style={styles.sweepRadioHeader}>
                      <Ionicons 
                        name={sweepDestination === 'primary' ? "radio-button-on" : "radio-button-off"} 
                        size={18} 
                        color={sweepDestination === 'primary' ? "#f59e0b" : "#9ca3af"} 
                      />
                      <Text style={styles.sweepRadioTitle}>Sweep to Primary Wallet</Text>
                    </View>
                    <Text style={styles.sweepRadioSub}>{primaryAddress}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.sweepOptionCard, sweepDestination === 'custom' && styles.sweepOptionCardActive]}
                    onPress={() => setSweepDestination('custom')}
                  >
                    <View style={styles.sweepRadioHeader}>
                      <Ionicons 
                        name={sweepDestination === 'custom' ? "radio-button-on" : "radio-button-off"} 
                        size={18} 
                        color={sweepDestination === 'custom' ? "#f59e0b" : "#9ca3af"} 
                      />
                      <Text style={styles.sweepRadioTitle}>Sweep to Custom Address</Text>
                    </View>
                    {sweepDestination === 'custom' && (
                      <TextInput
                        style={styles.sweepInput}
                        placeholder="Enter destination address..."
                        placeholderTextColor="#64748b"
                        value={customAddressInput}
                        onChangeText={setCustomAddressInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Balance breakdown stats */}
                <View style={styles.sweepSummaryCard}>
                  <View style={styles.sweepSummaryRow}>
                    <Text style={styles.sweepSummaryLabel}>Remaining Balance:</Text>
                    <Text style={styles.sweepSummaryValue}>{balance.toFixed(4)} {token.symbol}</Text>
                  </View>
                  <View style={styles.sweepSummaryRow}>
                    <Text style={styles.sweepSummaryLabel}>Estimated Gas Fee:</Text>
                    <Text style={styles.sweepSummaryValue}>0.0012 {token.symbol}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.sweepSummaryRow}>
                    <Text style={[styles.sweepSummaryLabel, { fontWeight: '700', color: '#fff' }]}>Total Transfer Amount:</Text>
                    <Text style={[styles.sweepSummaryValue, { fontWeight: '700', color: '#22c55e' }]}>
                      {Math.max(0, balance - 0.0012).toFixed(4)} {token.symbol}
                    </Text>
                  </View>
                </View>

                <View style={styles.activeActionsRow}>
                  <TouchableOpacity 
                    style={[styles.actionButtonSecondary, { flex: 1 }]}
                    onPress={handleSweep}
                  >
                    <LinearGradient
                      colors={['#f59e0b', '#d97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientBtn}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Confirm Sweep</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButtonSecondary, { flex: 1, marginLeft: 12 }]}
                    onPress={() => setBurnerState('active')}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientBtn}
                    >
                      <Text style={styles.actionBtnText}>Back</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {burnerState === 'sweeping_loading' && (
              <View style={styles.modalBody}>
                <View style={styles.spinnerContainer}>
                  <ActivityIndicator size="large" color="#ef4444" />
                  <Text style={styles.spinnerText}>Sweeping funds...</Text>
                  <Text style={styles.spinnerSubText}>Transferring assets and wiping private keys</Text>
                </View>
              </View>
            )}

            {burnerState === 'sweeping_success' && (
              <View style={styles.modalBody}>
                <View style={styles.successIconContainer}>
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.02)']}
                    style={styles.checkIconBg}
                  >
                    <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                  </LinearGradient>
                </View>

                <Text style={styles.burnerSuccessHeading}>Sweep Complete!</Text>
                <Text style={styles.burnerSuccessSub}>
                  All remaining funds have been swept to the destination address. The private keys have been discarded and this burner address is now deactivated.
                </Text>

                <TouchableOpacity 
                  style={styles.actionButtonSuccess}
                  onPress={resetBurnerModal}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.actionBtnText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* Local contextual AIBrain bubble removed because it's global */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backBtn: {
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  titleLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  swapBtnHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  swapText: {
    fontSize: 10,
    color: CloudVoidTheme.colors.textSecondary,
    marginTop: 2,
  },
  buyBtnHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  buyText: {
    fontSize: 10,
    color: CloudVoidTheme.colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  tokenMeta: {
    alignItems: 'center',
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: '400',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 4,
  },
  fiatBalance: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
  },
  inlinePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 36,
  },
  inlinePriceText: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
  },
  inlinePriceChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionBtn: {
    width: 56,
    height: 56,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 20,
    padding: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
  },
  statsBody: {
    marginTop: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
  },
  statsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: CloudVoidTheme.colors.border,
    marginVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.accentGlow,
    fontWeight: '600',
  },
  burnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: CloudVoidTheme.radii.pill,
  },
  burnerText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalBackgroundDismiss: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalCloseBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  flameIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  burnerDescriptionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  burnerDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  networkLabel: {
    fontSize: 13,
    color: '#9ca3af',
  },
  networkValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonPrimary: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  spinnerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  spinnerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 6,
  },
  spinnerSubText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  checkIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  burnerSuccessHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  burnerSuccessSub: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 30,
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtnInline: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  actionButtonSuccess: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  activeActionsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },
  actionButtonSecondary: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sweepOptionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  sweepOptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
  },
  sweepOptionCardActive: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  sweepRadioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  sweepRadioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sweepRadioSub: {
    fontSize: 12,
    color: '#64748b',
    paddingLeft: 28,
  },
  sweepInput: {
    marginTop: 8,
    marginLeft: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 13,
  },
  sweepSummaryCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  sweepSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sweepSummaryLabel: {
    fontSize: 13,
    color: '#9ca3af',
  },
  sweepSummaryValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
