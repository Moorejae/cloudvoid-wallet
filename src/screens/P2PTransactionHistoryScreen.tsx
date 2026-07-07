import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function P2PTransactionHistoryScreen({ navigation }: any) {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filterOptions = [
    { id: 'All', label: 'All', icon: null, color: '#a78bfa' },
    { id: 'Successful Trade', label: 'Successful Trade', icon: 'checkmark-circle', color: '#22c55e' },
    { id: 'Cancelled Trade', label: 'Cancelled Trade', icon: 'close-circle', color: '#ef4444' },
    { id: 'Pending Trade', label: 'Pending Trade', icon: 'time', color: '#f59e0b' },
  ];

  const showCompleted = selectedStatus === 'All' || selectedStatus === 'Successful Trade';
  const showCancelled = selectedStatus === 'All' || selectedStatus === 'Cancelled Trade';
  const showPending = selectedStatus === 'All' || selectedStatus === 'Pending Trade';

  const hasYesterday = showCompleted || showCancelled || showPending;
  const hasOct26 = showCompleted || showCancelled;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Merchant Transaction Ledger</Text>
        <View style={styles.headerBtnRight} />
      </View>

      {/* Top Bar: Search & Status Filter */}
      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#6b7280" />
        </View>
        <TouchableOpacity style={styles.statusPill} onPress={() => setShowFilter(true)}>
          <Ionicons name="options-outline" size={18} color={CloudVoidTheme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Yesterday Section */}
        {hasYesterday && <Text style={styles.sectionHeader}>Yesterday</Text>}
        
        {/* Success Transaction */}
        {showCompleted && (
          <TouchableOpacity 
            style={styles.txCard}
            onPress={() => navigation.navigate('P2PTransactionDetails', { txStatus: 'Completed' })}
          >
            <View style={styles.txLeft}>
              <Ionicons name="checkmark-circle" size={28} color="#22c55e" style={styles.txStatusIcon} />
              <View>
                <Text style={[styles.txPrimary, { color: '#22c55e' }]}>+0.05 BTC <Text style={styles.txLight}>(Sale)</Text></Text>
                <Text style={styles.txSecondary}>OPay C146, 2024</Text>
                <Text style={[styles.txStatusText, { color: '#22c55e' }]}>Completed</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Cancelled Transaction */}
        {showCancelled && (
          <TouchableOpacity 
            style={styles.txCard}
            onPress={() => navigation.navigate('P2PTransactionDetails', { txStatus: 'Cancelled' })}
          >
            <View style={styles.txLeft}>
              <Ionicons name="close-circle" size={28} color="#ef4444" style={styles.txStatusIcon} />
              <View>
                <Text style={[styles.txPrimary, { color: '#ef4444' }]}>-250 USDT <Text style={styles.txLight}>(Buy)</Text></Text>
                <Text style={styles.txSecondary}>$22.78, 2024, OPay</Text>
                <Text style={[styles.txStatusText, { color: '#ef4444' }]}>Cancelled</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Pending Transaction */}
        {showPending && (
          <TouchableOpacity 
            style={styles.txCard}
            onPress={() => navigation.navigate('ActiveTradeChat')}
          >
            <View style={styles.txLeft}>
              <Ionicons name="time" size={28} color="#f59e0b" style={styles.txStatusIcon} />
              <View>
                <Text style={[styles.txPrimary, { color: '#f59e0b' }]}>-500 USDT <Text style={styles.txLight}>(Buy)</Text></Text>
                <Text style={styles.txSecondary}>$38.88, 2024, OPay</Text>
                <Text style={[styles.txStatusText, { color: '#f59e0b' }]}>Pending</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Oct 26 Section */}
        {hasOct26 && <Text style={styles.sectionHeader}>Oct 26</Text>}

        {showCompleted && (
          <TouchableOpacity 
            style={styles.txCard}
            onPress={() => navigation.navigate('P2PTransactionDetails', { txStatus: 'Completed' })}
          >
            <View style={styles.txLeft}>
              <View style={[styles.cryptoIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="logo-bitcoin" size={16} color={CloudVoidTheme.colors.textPrimary} />
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: CloudVoidTheme.colors.textPrimary }]}>Bitcoin</Text>
                <Text style={styles.txSecondary}>$30,121.75 ~R</Text>
                <Text style={[styles.txStatusText, { color: '#22c55e' }]}>Active</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <View style={styles.pillTag}>
                <Text style={styles.pillTagText}>Manual Swap</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {showCancelled && (
          <TouchableOpacity 
            style={styles.txCard}
            onPress={() => navigation.navigate('P2PTransactionDetails', { txStatus: 'Cancelled' })}
          >
            <View style={styles.txLeft}>
              <View style={[styles.cryptoIcon, { backgroundColor: '#ef4444' }]}>
                <Ionicons name="logo-yen" size={16} color={CloudVoidTheme.colors.textPrimary} />
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: CloudVoidTheme.colors.textPrimary }]}>Ethereum</Text>
                <Text style={styles.txSecondary}>$121.73 <Text style={{color: '#22c55e'}}>-3.60%</Text></Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmountNegative}>-250 USDT</Text>
              <Text style={styles.txAmountDetails}>$38.88  <Text style={{color: '#ef4444'}}>-20%</Text></Text>
            </View>
          </TouchableOpacity>
        )}

        {showCompleted && (
          <TouchableOpacity 
            style={styles.txCard}
            onPress={() => navigation.navigate('P2PTransactionDetails', { txStatus: 'Completed' })}
          >
            <View style={styles.txLeft}>
              <View style={[styles.cryptoIcon, { backgroundColor: '#26a17b' }]}>
                <Text style={{color: CloudVoidTheme.colors.textPrimary, fontSize: 16, fontWeight: '700'}}>₮</Text>
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: '#22c55e' }]}>+100 USDT</Text>
                <Text style={styles.txSecondary}>Deposit</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmountNegative}>-300 USDT</Text>
              <Text style={styles.txAmountDetails}>$10.73  <Text style={{color: '#ef4444'}}>-30%</Text></Text>
            </View>
          </TouchableOpacity>
        )}
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Filter Modal Overlay */}
      <Modal
        visible={showFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={styles.filterCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.filterTitle}>Filter by Status</Text>
            
            <View style={styles.filterOptionsContainer}>
              {filterOptions.map((option) => (
                <TouchableOpacity 
                  key={option.id} 
                  style={styles.filterOptionRow}
                  onPress={() => setSelectedStatus(option.id)}
                >
                  <View style={styles.radioCircle}>
                    {selectedStatus === option.id && <View style={styles.radioInner} />}
                  </View>
                  {option.icon && (
                    <Ionicons name={option.icon as any} size={20} color={option.color} style={{marginHorizontal: 8}} />
                  )}
                  <Text style={[styles.filterOptionText, !option.icon && {marginLeft: 8}]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedStatus('All')}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    width: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchWrapper: {
    flex: 1,
    height: 40,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginRight: 16,
  },
  statusPill: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.btnBg,
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 16,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1c1c24', // distinct card background
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txStatusIcon: {
    marginRight: 12,
  },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txPrimary: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  txLight: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  txSecondary: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 2,
  },
  txStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  txAmountNegative: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  txAmountDetails: {
    color: '#9ca3af',
    fontSize: 11,
  },
  pillTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillTagText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCard: {
    backgroundColor: '#1f2937',
    width: '85%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  filterTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  filterOptionsContainer: {
    marginBottom: 24,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  filterOptionText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '600',
  },
});
