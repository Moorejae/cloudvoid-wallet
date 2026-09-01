import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform, Linking, ActivityIndicator } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import DoubleConfirmModal from '../components/DoubleConfirmModal';
import VaultPasswordModal from '../components/VaultPasswordModal';
import { usePreventLeave } from '../hooks/usePreventLeave';
import { ethers } from 'ethers';
import { sendEvm, evmChainForSymbol, EvmChain } from '../services/onchain';

export default function SendScreen({ route, navigation }: any) {
  const token = route.params?.token || { symbol: 'BTC', name: 'Bitcoin', price: 64230.00, change: 2.4, icon: '🧡', color: '#f59e0b' };
  
  const { balances, setBalances, addTransaction } = useWalletStore((state) => state);
  const currentBalance = balances[token.symbol] || 0;

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [vaultPassword, setVaultPassword] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const chain: EvmChain | undefined = evmChainForSymbol(token.symbol);
  const isEvm = Boolean(chain);

  usePreventLeave(navigation, address.trim().length > 0 || parseFloat(amount) > 0, {
    title: 'Discard transaction?',
    message: 'Your draft transaction will be lost if you leave.',
  });

  const parsedAmount = parseFloat(amount) || 0;
  const addressValid = isEvm ? ethers.isAddress(address.trim()) : address.trim().length >= 26;
  const isInputValid = addressValid && parsedAmount > 0 && parsedAmount <= currentBalance;

  const handleSendPress = () => {
    if (!isInputValid) return;
    if (!isEvm) {
      Alert.alert(
        'On-chain send is EVM-only right now',
        'Native send currently supports Ethereum, BNB, Avalanche, Polygon and Mantle. Solana and other chains are next.'
      );
      return;
    }
    // Web vault is password-locked — unlock once before signing.
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

  const handleConfirmSend = async (password?: string) => {
    setIsConfirmOpen(false);
    if (!chain) return;

    setSending(true);
    setError(null);
    try {
      const valueWei = ethers.parseUnits(parsedAmount.toFixed(chain.decimals), chain.decimals);
      const result = await sendEvm({
        chainId: chain.chainId,
        to: address.trim(),
        valueWei,
        password,
      });

      // Deduct balance + log a REAL transaction (signed & broadcast on-chain).
      setBalances({ [token.symbol]: Math.max(0, currentBalance - parsedAmount) });
      addTransaction({
        id: result.txHash,
        type: 'Send',
        token: token.symbol,
        amount: parsedAmount,
        fiatAmount: parsedAmount * token.price,
        status: 'Confirmed',
        counterparty: address.substring(0, 10) + '...',
        timestamp: 'Just now',
      });

      Alert.alert(
        'Transaction Sent 🎉',
        `Signed and broadcast on ${chain.name}.\n\nTx: ${result.txHash}`,
        [
          result.explorer
            ? { text: 'View on Explorer', onPress: () => Linking.openURL(result.explorer) }
            : { text: 'OK', onPress: () => {} },
          { text: 'Done', onPress: () => navigation.popToTop() },
        ]
      );
    } catch (e: any) {
      const msg = e?.message || 'Failed to send';
      setError(msg);
      Alert.alert('Send Failed', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Send {token.symbol}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Network Banner */}
      <View style={[styles.gasBanner, { borderColor: isEvm ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)' }]}>
        <Text style={styles.gasText}>
          {isEvm
            ? `🌐 Network: ${chain!.name} (${chain!.symbol}) — real on-chain send`
            : `⚠️ ${token.symbol} send is pending — on-chain send is live on EVM chains (ETH, BNB, AVAX, POL, MNT).`}
        </Text>
      </View>

      {/* Available Balance Box */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>{currentBalance.toFixed(4)} {token.symbol}</Text>
        <Text style={styles.balanceFiat}>
          ~ ${(currentBalance * token.price).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
        </Text>
      </View>

      {/* Address Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Recipient Address</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={isEvm ? `0x... (${chain!.name})` : 'Wallet address'}
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount to Send</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity 
            style={styles.maxBtn}
            onPress={() => setAmount(currentBalance.toString())}
          >
            <Text style={styles.maxText}>MAX</Text>
          </TouchableOpacity>
        </View>
        {parsedAmount > currentBalance && (
          <Text style={styles.errorText}>Insufficient funds available</Text>
        )}
        {!addressValid && address.trim().length > 0 && (
          <Text style={styles.errorText}>{isEvm ? 'Enter a valid EVM address (0x...)' : 'Enter a valid address'}</Text>
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.sendBtn,
          { backgroundColor: isInputValid ? CloudVoidTheme.colors.accent : '#2a2a2a' }
        ]}
        onPress={handleSendPress}
        disabled={!isInputValid || sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.sendBtnText, { color: isInputValid ? CloudVoidTheme.colors.btnText : CloudVoidTheme.colors.textSecondary }]}>
            {isEvm ? 'Sign & Send' : 'Send Assets'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Double Confirmation Modal */}
      <DoubleConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => handleConfirmSend(Platform.OS === 'web' ? vaultPassword : undefined)}
        title="Confirm Transfer"
        message={`You are about to send ${parsedAmount} ${token.symbol} on ${chain?.name || 'the network'} to ${address.substring(0, 14)}... This will be signed locally and broadcast on-chain.`}
        confirmText="Sign & Broadcast"
        confirmBg={CloudVoidTheme.colors.accent}
      />

      {/* Web vault unlock (password) before signing */}
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
  balanceCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  balanceLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 4,
  },
  balanceFiat: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: CloudVoidTheme.radii.input,
    height: 56,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  maxBtn: {
    padding: 6,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  maxText: {
    fontSize: 12,
    fontWeight: '700',
    color: CloudVoidTheme.colors.accentGlow,
  },
  errorText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.danger,
    marginTop: 8,
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
  gasBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 32,
  },
  gasText: {
    fontSize: 12,
    fontWeight: '600',
    color: CloudVoidTheme.colors.success,
  },
  sendBtn: {
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
