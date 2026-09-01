import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Modal, FlatList, Image, Platform, Linking } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import DoubleConfirmModal from '../components/DoubleConfirmModal';
import VaultPasswordModal from '../components/VaultPasswordModal';
import { usePreventLeave } from '../hooks/usePreventLeave';
import { ethers } from 'ethers';
import {
  ETHEREUM_TOKENS,
  EvmToken,
  getAggregatorQuote,
  executeAggregatedSwap,
  waitForReceipt,
} from '../services/onchain';

const CHAIN_LABEL = { name: 'Ethereum', chainId: 1, symbol: 'ETH', explorer: 'https://etherscan.io' };

function fmtTokenAmount(wei: string, decimals: number): string {
  try {
    return ethers.formatUnits(wei || '0', decimals);
  } catch {
    return '0.0';
  }
}

function routeSummary(route: any): string {
  try {
    const names: string[] = [];
    (route.bestRoute || []).forEach((leg: any) => {
      (leg.swaps || []).forEach((sw: any) => {
        (sw.swapExchanges || []).forEach((ex: any) => names.push(ex.exchange));
      });
    });
    const unique = Array.from(new Set(names));
    return unique.slice(0, 4).join(' → ') || 'ParaSwap router';
  } catch {
    return 'ParaSwap router';
  }
}

export default function SwapScreen({ navigation }: any) {
  const { balances, setBalances, addTransaction } = useWalletStore((state) => state);
  const wallets = useWalletStore((state) => state.wallets);
  const activeWalletId = useWalletStore((state) => state.activeWalletId);
  const userId = useWalletStore((state) => state.userId);
  // Real wallet address — swaps sign against the user's actual derived address.
  const activeWallet = wallets.find(w => w.id === activeWalletId) || wallets[0];
  const walletAddress = activeWallet?.address || userId || '';

  const [fromToken, setFromToken] = useState<EvmToken>(ETHEREUM_TOKENS[0]); // ETH
  const [toToken, setToToken] = useState<EvmToken>(ETHEREUM_TOKENS[1]);     // USDT
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [quoting, setQuoting] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [vaultPassword, setVaultPassword] = useState<string | undefined>(undefined);
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePreventLeave(navigation, parseFloat(fromAmount) > 0, {
    title: 'Discard swap?',
    message: 'Your swap order will be lost if you leave.',
  });

  const fromBalance = balances[fromToken.symbol] || 0;
  const toBalance = balances[toToken.symbol] || 0;

  const parsedFrom = parseFloat(fromAmount) || 0;
  const amountWei =
    parsedFrom > 0
      ? ethers.parseUnits(parsedFrom.toFixed(fromToken.decimals), fromToken.decimals).toString()
      : '0';
  const isInputValid = parsedFrom > 0 && parsedFrom <= fromBalance && fromToken.address !== toToken.address;

  useEffect(() => {
    setQuote(null);
    setError(null);
  }, [fromAmount, fromToken, toToken]);

  const handleGetQuote = async () => {
    if (!isInputValid) return;
    if (!walletAddress) {
      Alert.alert('No Wallet', 'Create or import a wallet before swapping.');
      return;
    }
    setQuoting(true);
    setError(null);
    try {
      const route = await getAggregatorQuote({
        srcToken: fromToken.address,
        destToken: toToken.address,
        amount: amountWei,
        srcDecimals: fromToken.decimals,
        destDecimals: toToken.decimals,
        network: CHAIN_LABEL.chainId,
      });
      setQuote(route);
    } catch (e: any) {
      const msg = e?.message || 'Failed to retrieve swap quote.';
      setError(msg);
      Alert.alert('Quote Failed', msg);
    }
    setQuoting(false);
  };

  const handleSwapPress = () => {
    if (!quote) return;
    if (Platform.OS === 'web') {
      setShowPasswordModal(true);
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleUnlockConfirm = (password: string) => {
    setVaultPassword(password);
    setShowPasswordModal(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmSwap = async () => {
    setIsConfirmOpen(false);
    setSwapping(true);
    setError(null);
    try {
      const result = await executeAggregatedSwap({
        chainId: CHAIN_LABEL.chainId,
        srcToken: fromToken,
        destToken: toToken,
        amountWei,
        userAddress: walletAddress,
        password: Platform.OS === 'web' ? vaultPassword : undefined,
      });

      const receipt = result.txHash ? await waitForReceipt(CHAIN_LABEL.chainId, result.txHash) : null;
      const destAmount = result.destAmount ? parseFloat(fmtTokenAmount(result.destAmount, toToken.decimals)) : 0;

      setBalances({
        [fromToken.symbol]: Math.max(0, fromBalance - parsedFrom),
        [toToken.symbol]: toBalance + (isNaN(destAmount) ? 0 : destAmount),
      });

      addTransaction({
        id: result.txHash || 'tx_' + Math.random().toString(36).substring(2, 10),
        type: 'Swap',
        token: `${fromToken.symbol}➔${toToken.symbol}`,
        amount: parsedFrom,
        fiatAmount: parsedFrom * (balances[fromToken.symbol] || 1),
        status: receipt ? 'Confirmed' : 'Pending',
        counterparty: 'ParaSwap (real DEX route)',
        timestamp: 'Just now',
      });

      Alert.alert(
        'Swap Executed 🎉',
        `Swapped ${parsedFrom} ${fromToken.symbol} for ${destAmount.toFixed(6)} ${toToken.symbol}.\n\nTx: ${result.txHash}`,
        [
          { text: 'View on Explorer', onPress: () => Linking.openURL(`${CHAIN_LABEL.explorer}/tx/${result.txHash}`) },
          { text: 'Done', onPress: () => navigation.popToTop() },
        ]
      );
    } catch (e: any) {
      const msg = e?.message || 'The swap failed to execute.';
      setError(msg);
      Alert.alert('Swap Failed', msg);
    } finally {
      setSwapping(false);
    }
  };

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setQuote(null);
  };

  const selectToken = (t: EvmToken) => {
    if (picking === 'from') {
      setFromToken(t.address === toToken.address ? toToken : t);
    } else if (picking === 'to') {
      setToToken(t.address === fromToken.address ? fromToken : t);
    }
    setPicking(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Swap · {CHAIN_LABEL.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* From Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>From</Text>
          <Text style={styles.balanceText}>Balance: {fromBalance.toFixed(4)} {fromToken.symbol}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            keyboardType="decimal-pad"
            value={fromAmount}
            onChangeText={setFromAmount}
          />
          <TouchableOpacity style={styles.tokenPill} onPress={() => setPicking('from')}>
            <Image source={{ uri: fromToken.icon }} style={styles.tokenIconSm} />
            <Text style={styles.tokenText}>{fromToken.symbol}</Text>
            <Ionicons name="chevron-down" size={16} color={CloudVoidTheme.colors.backBtn} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Interchanger Switch Button */}
      <TouchableOpacity style={styles.switchBtn} onPress={handleSwitch}>
        <Ionicons name="swap-vertical" size={20} color={CloudVoidTheme.colors.accent} />
      </TouchableOpacity>

      {/* To Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>To (Estimated)</Text>
          <Text style={styles.balanceText}>Balance: {toBalance.toFixed(4)} {toToken.symbol}</Text>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.estimatedText}>
            {quote ? parseFloat(fmtTokenAmount(quote.destAmount, toToken.decimals)).toFixed(6) : '0.00'}
          </Text>
          <TouchableOpacity style={styles.tokenPill} onPress={() => setPicking('to')}>
            <Image source={{ uri: toToken.icon }} style={styles.tokenIconSm} />
            <Text style={styles.tokenText}>{toToken.symbol}</Text>
            <Ionicons name="chevron-down" size={16} color={CloudVoidTheme.colors.backBtn} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Slippage Settings */}
      <View style={styles.slippageContainer}>
        <Text style={styles.slippageLabel}>Slippage Tolerance</Text>
        <View style={styles.slippageRow}>
          {[0.1, 0.5, 1.0].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.slippageBtn, slippage === s ? styles.slippageActiveBtn : null]}
              onPress={() => setSlippage(s)}
            >
              <Text style={[styles.slippageText, slippage === s ? styles.slippageActiveText : null]}>
                {s}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Details Card */}
      {quote && (
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>You receive</Text>
            <Text style={styles.detailValue}>
              {parseFloat(fmtTokenAmount(quote.destAmount, toToken.decimals)).toFixed(6)} {toToken.symbol}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Route</Text>
            <Text style={[styles.detailValue, { color: '#3B99FC' }]}>{routeSummary(quote)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network fee (est.)</Text>
            <Text style={styles.detailValue}>${(parseFloat(quote.gasCostUSD || '0')).toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Platform fee</Text>
            <Text style={styles.detailValue}>0% (no platform fee)</Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Swap Execute Button */}
      {!quote ? (
        <TouchableOpacity
          style={[
            styles.swapBtn,
            { backgroundColor: isInputValid ? CloudVoidTheme.colors.accent : '#2a2a2a' }
          ]}
          onPress={handleGetQuote}
          disabled={!isInputValid || quoting}
        >
          {quoting ? (
            <ActivityIndicator color={CloudVoidTheme.colors.btnText} />
          ) : (
            <Text style={[styles.swapBtnText, { color: isInputValid ? CloudVoidTheme.colors.btnText : CloudVoidTheme.colors.textSecondary }]}>
              Get Real Quote
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.swapBtn,
            { backgroundColor: swapping ? '#2a2a2a' : CloudVoidTheme.colors.success }
          ]}
          onPress={handleSwapPress}
          disabled={swapping}
        >
          {swapping ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.swapBtnText, { color: '#fff' }]}>
              Execute Swap
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Token Picker Modal */}
      <Modal visible={picking !== null} transparent animationType="slide" onRequestClose={() => setPicking(null)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>Select token on {CHAIN_LABEL.name}</Text>
            <FlatList
              data={ETHEREUM_TOKENS}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerRow} onPress={() => selectToken(item)}>
                  <Image source={{ uri: item.icon }} style={styles.tokenIconMd} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerSymbol}>{item.symbol}</Text>
                    <Text style={styles.pickerName}>{item.name}</Text>
                  </View>
                  {(picking === 'from' && item.address === fromToken.address) ||
                    (picking === 'to' && item.address === toToken.address) ? (
                    <Ionicons name="checkmark-circle" size={20} color={CloudVoidTheme.colors.success} />
                  ) : null}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setPicking(null)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Double Confirm Modal */}
      {quote && (
        <DoubleConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmSwap}
          title="Confirm Token Swap"
          message={`You are about to swap ${parsedFrom} ${fromToken.symbol} for approximately ${parseFloat(fmtTokenAmount(quote.destAmount, toToken.decimals)).toFixed(4)} ${toToken.symbol} via ${routeSummary(quote)}. Signed locally and broadcast on-chain. No platform fee.`}
          confirmText="Sign & Swap"
          confirmBg={CloudVoidTheme.colors.accent}
        />
      )}

      {/* Web vault unlock before signing */}
      <VaultPasswordModal
        visible={showPasswordModal}
        mode="unlock"
        onCancel={() => setShowPasswordModal(false)}
        onConfirm={handleUnlockConfirm}
      />
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
    marginBottom: 32,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  swapCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
  },
  balanceText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
    padding: 0,
  },
  estimatedText: {
    fontSize: 28,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: CloudVoidTheme.radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  tokenText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  switchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    zIndex: 10,
  },
  slippageContainer: {
    marginVertical: 24,
  },
  slippageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 8,
  },
  slippageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slippageBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  slippageActiveBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderColor: CloudVoidTheme.colors.accent,
  },
  slippageText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
  },
  slippageActiveText: {
    color: CloudVoidTheme.colors.textPrimary,
  },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
  },
  swapBtn: {
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  swapBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tokenIconSm: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tokenIconMd: {
    width: 36,
    height: 36,
    borderRadius: 9,
    marginRight: 12,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.danger,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerSymbol: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerName: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
  },
  pickerCancel: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
  },
  pickerCancelText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
