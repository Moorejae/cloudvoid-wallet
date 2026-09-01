import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import DoubleConfirmModal from '../components/DoubleConfirmModal';
import { getSwapQuote, executeSwap, SwapQuote } from '../services/web3Api';

export default function SwapScreen({ navigation }: any) {
  const { balances, setBalances, addTransaction } = useWalletStore((state) => state);
  const wallets = useWalletStore((state) => state.wallets);
  const activeWalletId = useWalletStore((state) => state.activeWalletId);
  const userId = useWalletStore((state) => state.userId);
  // Real wallet address — swaps sign against the user's actual derived address.
  const activeWallet = wallets.find(w => w.id === activeWalletId) || wallets[0];
  const walletAddress = activeWallet?.address || userId || '';
  
  const [fromToken, setFromToken] = useState('USDT');
  const [toToken, setToToken] = useState('SOL');
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoting, setQuoting] = useState(false);

  const fromBalance = balances[fromToken] || 0;
  const toBalance = balances[toToken] || 0;

  const parsedFrom = parseFloat(fromAmount) || 0;
  const isInputValid = parsedFrom > 0 && parsedFrom <= fromBalance && fromToken !== toToken;

  useEffect(() => {
    setQuote(null);
  }, [fromAmount, fromToken, toToken]);

  const handleGetQuote = async () => {
    if (!isInputValid) return;
    if (!walletAddress) {
      Alert.alert('No Wallet', 'Create or import a wallet before swapping.');
      return;
    }
    setQuoting(true);
    const result = await getSwapQuote(fromToken, toToken, parsedFrom, walletAddress);
    if (result) {
      setQuote(result);
    } else {
      Alert.alert('Error', 'Failed to retrieve swap quote.');
    }
    setQuoting(false);
  };

  const handleSwapPress = () => {
    if (!quote) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSwap = async () => {
    if (!quote) return;
    setIsConfirmOpen(false);
    setQuoting(true);

    const result = await executeSwap(
      fromToken,
      toToken,
      parsedFrom,
      walletAddress,
      quote.estimatedOutput
    );

    if (result && result.status === 'confirmed') {
      // Update balances
      const newBalances = {
        [fromToken]: fromBalance - parsedFrom,
        [toToken]: toBalance + result.outputAmount
      };
      setBalances(newBalances);

      // Log transaction
      addTransaction({
        id: result.transactionHash,
        type: 'Swap',
        token: `${fromToken}➔${toToken}`,
        amount: parsedFrom,
        fiatAmount: parsedFrom * (quote.exchangeRate || 1.0),
        status: 'Confirmed',
        counterparty: '1inch Liquidity Router',
        timestamp: 'Just now'
      });

      Alert.alert('Swap Executed', `Swapped ${parsedFrom} ${fromToken} for ${result.outputAmount.toFixed(4)} ${toToken} successfully.`);
      navigation.popToTop();
    } else {
      Alert.alert('Swap Failed', 'The swap transaction failed to execute.');
    }
    setQuoting(false);
  };

  const handleSwitch = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
    setQuote(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Swap Router</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* From Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>From</Text>
          <Text style={styles.balanceText}>Balance: {fromBalance.toFixed(3)} {fromToken}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            keyboardType="numeric"
            value={fromAmount}
            onChangeText={setFromAmount}
          />
          <TouchableOpacity style={styles.tokenPill} onPress={() => Alert.alert('Token Select', 'Dynamic tokens list locked for safety.')}>
            <Text style={styles.tokenText}>{fromToken}</Text>
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
          <Text style={styles.balanceText}>Balance: {toBalance.toFixed(3)} {toToken}</Text>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.estimatedText}>
            {quote ? quote.estimatedOutput.toFixed(5) : '0.00'}
          </Text>
          <TouchableOpacity style={styles.tokenPill} onPress={() => Alert.alert('Token Select', 'Dynamic tokens list locked for safety.')}>
            <Text style={styles.tokenText}>{toToken}</Text>
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
            <Text style={styles.detailLabel}>Exchange Rate</Text>
            <Text style={styles.detailValue}>
              1 {fromToken} ≈ {quote.exchangeRate} {toToken}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Convenience Fee (1%)</Text>
            <Text style={styles.detailValue}>{(quote as any).convenienceFee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gas Fee</Text>
            <Text style={styles.detailValue}>{quote.gasFee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paymaster Gas Sponsor</Text>
            <Text style={[styles.detailValue, { color: CloudVoidTheme.colors.success }]}>Active 🟢</Text>
          </View>
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
              Get Quote
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.swapBtn,
            { backgroundColor: CloudVoidTheme.colors.success }
          ]}
          onPress={handleSwapPress}
          disabled={quoting}
        >
          <Text style={[styles.swapBtnText, { color: '#fff' }]}>
            Execute Swap
          </Text>
        </TouchableOpacity>
      )}

      {/* Double Confirm Modal */}
      {quote && (
        <DoubleConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmSwap}
          title="Confirm Token Swap"
          message={`You are about to swap ${parsedFrom} ${fromToken} for approximately ${quote.estimatedOutput.toFixed(4)} ${toToken}. A 1% platform fee is included.`}
          confirmText="Confirm Swap"
          confirmBg={CloudVoidTheme.colors.accent}
        />
      )}
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
});
