import React, { useState } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type FilterType = 'All' | 'Deposit' | 'Withdraw' | 'Card Fund' | 'Card Purchase' | 'Convert';

interface Transaction {
  id: string;
  type: FilterType;
  title: string;
  date: string;
  amount: string;
  isPositive: boolean;
  iconName: any;
  iconColor: string;
  iconBg: string;
}

const TRANSACTIONS: Transaction[] = [];

export default function FiatTransactionListScreen({ navigation }: any) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredData = activeFilter === 'All' 
    ? TRANSACTIONS 
    : TRANSACTIONS.filter(t => t.type === activeFilter);

  const FilterOption = ({ type, label, iconName, iconColor, iconBg }: any) => {
    const isSelected = activeFilter === type;
    
    return (
      <TouchableOpacity 
        style={[styles.filterOptionItem, isSelected && styles.filterOptionSelected]} 
        onPress={() => {
          setActiveFilter(type);
          setFilterVisible(false);
        }}
      >
        <View style={styles.filterOptionLeft}>
          <View style={[styles.filterIconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={16} color={iconColor} />
          </View>
          <Text style={styles.filterOptionLabel}>{label}</Text>
        </View>
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <Ionicons name="checkmark" size={14} color={CloudVoidTheme.colors.textPrimary} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction List</Text>
        <TouchableOpacity 
          style={styles.filterBtn} 
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={16} color="#6d28d9" />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Graphic */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#2a3b52', '#3f5773', '#1e293b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGraphic}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.brandText}>
                <Text style={{ fontWeight: '800' }}>CLOUD</Text>VOID
              </Text>
              <View style={styles.cardTypeContainer}>
                <Ionicons name="cloud-outline" size={24} color={CloudVoidTheme.colors.textPrimary} />
                <Text style={styles.cardTypeText}>DEBIT</Text>
              </View>
            </View>

            <LinearGradient colors={['#d1d5db', '#9ca3af']} style={styles.chip}>
              <View style={styles.chipLine1} />
              <View style={styles.chipLine2} />
              <View style={styles.chipLine3} />
            </LinearGradient>

            <Text style={styles.cardNumber}>****  ****  1234</Text>

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardExpiry}>08/28</Text>
                <Text style={styles.cardHolder}>M. Thompson</Text>
              </View>
              <View style={styles.mastercardLogo}>
                <View style={[styles.mcCircle, { backgroundColor: '#eb001b', left: 10 }]} />
                <View style={[styles.mcCircle, { backgroundColor: '#f79e1b', opacity: 0.8 }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Transaction List Card */}
        <View style={styles.listCard}>
          {filteredData.map((tx, index) => (
            <View key={tx.id}>
              <View style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View style={[styles.txIconContainer, { backgroundColor: tx.iconBg }]}>
                    <Ionicons name={tx.iconName} size={20} color={tx.iconColor} />
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, tx.isPositive && styles.txAmountPositive]}>
                  {tx.amount}
                </Text>
              </View>
              {index < filteredData.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          {filteredData.length === 0 && (
            <Text style={styles.emptyText}>No transactions found.</Text>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Filter Dropdown Modal (simulating side panel) */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setFilterVisible(false)}>
          <View style={styles.filterDropdown}>
            
            <FilterOption 
              type="All" 
              label="All Transactions" 
              iconName="list" 
              iconColor="#4b5563" 
              iconBg="#f3f4f6" 
            />
            <FilterOption 
              type="Deposit" 
              label="Deposit" 
              iconName="arrow-up" 
              iconColor="#22c55e" 
              iconBg="#dcfce7" 
            />
            <FilterOption 
              type="Withdraw" 
              label="Withdraw" 
              iconName="arrow-down" 
              iconColor="#ef4444" 
              iconBg="#fee2e2" 
            />
            <FilterOption 
              type="Card Fund" 
              label="Card Fund" 
              iconName="card-outline" 
              iconColor="#3b82f6" 
              iconBg="#dbeafe" 
            />
            <FilterOption 
              type="Card Purchase" 
              label="Card Purchase" 
              iconName="card-outline" 
              iconColor="#3b82f6" 
              iconBg="#dbeafe" 
            />
            <FilterOption 
              type="Convert" 
              label="Fiat to Dollar Convert" 
              iconName="swap-horizontal" 
              iconColor="#8b5cf6" 
              iconBg="#ede9fe" 
            />

          </View>
        </Pressable>
      </Modal>

      {/* Adding a back button explicitly in case user needs to navigate out via a bottom button or standard header gesture, 
          but for now relying on navigation gestures or replacing the header manually if needed.
          Wait, the image doesn't show a Back button, just "Transaction List" as the header.
          I'll add a floating back button or just standard react-navigation back behavior.
          I will add a small hidden back button to the top left so we can go back easily. */}
       <TouchableOpacity 
         style={styles.floatingBack} 
         onPress={() => navigation.goBack()}
       >
         <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
       </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  floatingBack: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54, // slightly lower to accommodate floating back button next to it
    paddingBottom: 20,
    paddingLeft: 48, // space for the floating back arrow
  },
  headerTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundcolor: CloudVoidTheme.colors.textPrimary,
    borderWidth: 1,
    borderColor: '#d8b4fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterBtnText: {
    color: '#6d28d9',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    marginBottom: 24,
  },
  cardGraphic: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandText: { color: CloudVoidTheme.colors.textPrimary, fontSize: 16, letterSpacing: 1 },
  cardTypeContainer: { alignItems: 'center' },
  cardTypeText: { color: CloudVoidTheme.colors.textPrimary, fontSize: 8, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
  chip: { width: 40, height: 28, borderRadius: 6, justifyContent: 'space-evenly', paddingVertical: 4 },
  chipLine1: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  chipLine2: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  chipLine3: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', width: '100%' },
  cardNumber: {
    color: CloudVoidTheme.colors.textPrimary, fontSize: 22, fontWeight: '500', letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardExpiry: { color: CloudVoidTheme.colors.textPrimary, fontSize: 12, marginBottom: 4 },
  cardHolder: { color: CloudVoidTheme.colors.textPrimary, fontSize: 14, fontWeight: '500' },
  mastercardLogo: { flexDirection: 'row', alignItems: 'center', width: 48, height: 30, justifyContent: 'center' },
  mcCircle: { width: 30, height: 30, borderRadius: 15, position: 'absolute' },
  
  listCard: {
    backgroundcolor: CloudVoidTheme.colors.textPrimary,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  txDate: {
    color: '#6b7280',
    fontSize: 11,
  },
  txAmount: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  txAmountPositive: {
    color: '#22c55e',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    width: '100%',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  spacer: {
    flex: 1,
    minHeight: 80,
  },

  // Modal / Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  filterDropdown: {
    position: 'absolute',
    top: 90,
    right: 16,
    width: 250,
    backgroundColor: '#faf5f0', // Slight warm off-white from mockup
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  filterOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundcolor: CloudVoidTheme.colors.textPrimary, // White card inside the warm modal
  },
  filterOptionSelected: {
    // maybe slight purple tint or nothing
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  filterOptionLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '500',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderColor: '#6d28d9',
  },
});
