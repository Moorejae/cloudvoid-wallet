import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function P2PTransactionDetailsScreen({ navigation, route }: any) {
  const txStatus = route.params?.txStatus || 'Completed';
  const isCancelled = txStatus === 'Cancelled';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={styles.headerBtnRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Integrated Card */}
        <View style={styles.receiptCard}>
          
          <View style={styles.cardHeader}>
            <Ionicons name="swap-horizontal" size={32} color={isCancelled ? '#ef4444' : '#8b5cf6'} style={styles.swapIcon} />
            <Text style={styles.cardTitle}>P2P USDT/NGN Trade</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>→ abc...123</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Merchant:</Text>
              <Text style={styles.detailValue}>CryptoKing (Verified)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, isCancelled && { color: '#ef4444' }]}>{txStatus}</Text>
            </View>
            {isCancelled && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cancel Reason:</Text>
                <Text style={styles.detailValue}>Timer ran out</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trade Date:</Text>
              <Text style={styles.detailValue}>Jul 30, 2026, 12:45 PM</Text>
            </View>
            {!isCancelled && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>Bank Transfer (UBA)</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.amountsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabelBold}>USDT {isCancelled ? 'To Buy' : 'Sold'}: →</Text>
              <Text style={styles.detailValueBold}>250.00 USDT</Text>
            </View>
            {!isCancelled && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabelBold}>Naira Sent: →</Text>
                <Text style={styles.detailValueBold}>410,000.00 NGN</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exchange Rate:</Text>
              <Text style={styles.detailValue}>1,640.00 NGN/USDT</Text>
            </View>
            {!isCancelled && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee:</Text>
                <Text style={styles.detailValue}>$0.50</Text>
              </View>
            )}
          </View>
          
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Save Receipt Button (only if not cancelled) */}
      {!isCancelled && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a',
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
    width: 80,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  receiptCard: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  swapIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  detailsSection: {
    gap: 12,
  },
  amountsSection: {
    gap: 12,
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
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  detailLabelBold: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
  },
  detailValueBold: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  spacer: {
    height: 100, // Large Spacious Bottom Gap
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 34, // Safe area
    paddingTop: 16,
    backgroundColor: '#12121a',
  },
  saveBtn: {
    backgroundColor: '#3730a3',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 15,
    fontWeight: '700',
  },
});
