import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

const TOKEN_ICONS: Record<string, string> = {
  BTC: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png',
  USDT: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  ETH: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  BNB: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
};

export default function TransactionReceiptScreen({ route, navigation }: any) {
  const { tx } = route.params || {};

  // Fallback data if navigated without params
  const transaction = tx || {
    id: 'tx_demo',
    type: 'Send',
    token: 'BTC',
    amount: -0.045,
    timestamp: 'July 28, 2024, 10:35 AM',
    counterparty: 'abc...123',
    status: 'Confirmed'
  };

  const isReceive = transaction.amount > 0 || transaction.type === 'Receive' || transaction.type === 'Deposit';
  const actionText = isReceive ? 'Received' : 'Sent';
  const iconUrl = TOKEN_ICONS[transaction.token] || TOKEN_ICONS['BTC'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={CloudVoidTheme.colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={{ uri: iconUrl }} style={styles.titleLogo} />
          <Text style={styles.headerTitle}>Transaction Receipt</Text>
        </View>

        <View style={styles.placeholderRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Indicator */}
        <View style={styles.statusSection}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark" size={32} color={CloudVoidTheme.colors.textPrimary} />
          </View>
          <Text style={styles.successText}>Transaction Successful</Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{transaction.token} {actionText}</Text>
            <Text style={styles.cardAmount}>{Math.abs(transaction.amount)} {transaction.token}</Text>
            <Text style={styles.cardDate}>{transaction.timestamp}</Text>
            <Text style={styles.cardHash}>{transaction.counterparty}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Sender:</Text>
              <Text style={styles.value}>{isReceive ? transaction.counterparty : 'bc1...xyz'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Recipient:</Text>
              <Text style={styles.value}>{isReceive ? 'bc1...xyz' : transaction.counterparty}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Fee:</Text>
              <Text style={styles.value}>0.00012 {transaction.token}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Total Paid:</Text>
              <Text style={styles.value}>{parseFloat((Math.abs(transaction.amount) + 0.00012).toFixed(5))} {transaction.token}</Text>
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>View on Blockchain</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Save Receipt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 2,
  },
  titleLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 6,
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '600',
  },
  placeholderRight: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  successText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  receiptCard: {
    width: '100%',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: CloudVoidTheme.colors.accentGlow,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardAmount: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardDate: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  cardHash: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: CloudVoidTheme.colors.border,
    marginVertical: 20,
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  footerBtn: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  footerBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
