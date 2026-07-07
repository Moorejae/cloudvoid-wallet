import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import DoubleConfirmModal from '../components/DoubleConfirmModal';

export default function SendScreen({ route, navigation }: any) {
  const token = route.params?.token || { symbol: 'BTC', name: 'Bitcoin', price: 64230.00, change: 2.4, icon: '🧡', color: '#f59e0b' };
  
  const { balances, setBalances, addTransaction } = useWalletStore((state) => state);
  const currentBalance = balances[token.symbol] || 0;

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const isInputValid = address.length >= 26 && parsedAmount > 0 && parsedAmount <= currentBalance;

  const handleSendPress = () => {
    if (!isInputValid) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    setIsConfirmOpen(false);
    
    // Deduct balance
    const newBalances = { [token.symbol]: currentBalance - parsedAmount };
    setBalances(newBalances);

    // Add transaction log
    addTransaction({
      id: 'tx_' + Math.random().toString(36).substring(2, 10),
      type: 'Send',
      token: token.symbol,
      amount: parsedAmount,
      fiatAmount: parsedAmount * token.price,
      status: 'Confirmed',
      counterparty: address.substring(0, 10) + '...',
      timestamp: 'Just now'
    });

    Alert.alert('Transfer Dispatched', `Transaction of ${parsedAmount} ${token.symbol} successfully processed by paymaster node.`);
    navigation.popToTop(); // Back to main screen
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
            placeholder="Enter MoveVM or native address"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
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
            keyboardType="numeric"
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
      </View>

      {/* Gas Paymaster Banner */}
      <View style={styles.gasBanner}>
        <Text style={styles.gasText}>🟢 gas sponsor active: MoveVM network fee is sponsored.</Text>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.sendBtn,
          { backgroundColor: isInputValid ? CloudVoidTheme.colors.accent : '#2a2a2a' }
        ]}
        onPress={handleSendPress}
        disabled={!isInputValid}
      >
        <Text style={[styles.sendBtnText, { color: isInputValid ? CloudVoidTheme.colors.btnText : CloudVoidTheme.colors.textSecondary }]}>
          Send Assets
        </Text>
      </TouchableOpacity>

      {/* Double Confirmation Modal */}
      <DoubleConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSend}
        title="Confirm Transfer"
        message={`You are about to transfer ${parsedAmount} ${token.symbol} to address ${address.substring(0, 14)}...`}
        confirmText="Confirm Transfer"
        confirmBg={CloudVoidTheme.colors.accent}
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
