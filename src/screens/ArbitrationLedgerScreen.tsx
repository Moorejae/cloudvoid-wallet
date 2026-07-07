import React, { useState } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LEDGER_CASES = [
  {
    id: 1,
    caseRef: '#9B...7C',
    date: 'Date 9/01...7C-4, 13:17:53 UTC',
    amount: '250 USDT',
    buyer: 'Buyer (Anonymous)',
    seller: 'Seller (Anonymous)',
    verdict: 'Voted for Buyer',
    outcome: 'Dispute Resolved in Favor of Buyer',
    status: 'Completed',
    isWinner: true,
  },
  {
    id: 2,
    group: 'Yesterday',
    caseRef: '#8A...4D',
    date: 'Date #8A...3074, 15:11:16 UTC',
    amount: '500 USDT',
    buyer: 'Buyer (Anonymous)',
    seller: 'Seller (Anonymous)',
    verdict: 'Voted for Seller (You)',
    outcome: 'Dispute Resolved in Favor of Seller',
    status: 'Completed',
    isWinner: true,
  },
  {
    id: 3,
    group: 'Oct 26',
    caseRef: '#7F...3B',
    date: 'Date #7F...36...34: 10:57:00 UTC',
    amount: '1000 USDT',
    buyer: 'Buyer (Anonymous)',
    seller: 'Seller (Anonymous)',
    verdict: 'ABANDONED',
    outcome: 'Dispute Closed Due to Jury Timeout',
    status: 'Abandoned',
    isWinner: false,
  },
];

export default function ArbitrationLedgerScreen({ navigation }: any) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredCases = LEDGER_CASES.filter((item) => {
    if (!activeFilter) return true;
    if (activeFilter === 'Completed (Buyer Voted)') return item.status === 'Completed' && item.verdict.includes('Buyer');
    if (activeFilter === 'Completed (Seller Voted)') return item.status === 'Completed' && item.verdict.includes('Seller');
    if (activeFilter === 'Abandoned (Timeout)') return item.status === 'Abandoned';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Completed and Abandoned Cases</Text>
        <View style={styles.headerBtnRight} />
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cases..."
            placeholderTextColor="#6b7280"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterPill} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={18} color={CloudVoidTheme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Dropdown */}
      {showFilters && (
        <View style={styles.filterDropdown}>
          <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter(null); setShowFilters(false); }}>
            <Text style={[styles.filterOptionText, !activeFilter && { color: '#a78bfa' }]}>All Cases</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('Completed (Buyer Voted)'); setShowFilters(false); }}>
            <Text style={[styles.filterOptionText, activeFilter === 'Completed (Buyer Voted)' && { color: '#a78bfa' }]}>Completed (Buyer Voted)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('Completed (Seller Voted)'); setShowFilters(false); }}>
            <Text style={[styles.filterOptionText, activeFilter === 'Completed (Seller Voted)' && { color: '#a78bfa' }]}>Completed (Seller Voted)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('Abandoned (Timeout)'); setShowFilters(false); }}>
            <Text style={[styles.filterOptionText, activeFilter === 'Abandoned (Timeout)' && { color: '#a78bfa' }]}>Abandoned (Timeout)</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredCases.map((item) => (
          <View key={item.id}>
            {item.group && (
              <Text style={styles.groupDate}>{item.group}</Text>
            )}
            
            <View style={styles.caseCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.caseTitle}>Case {item.caseRef} - {item.amount}</Text>
                <Text style={styles.caseDate}>{item.date}</Text>
              </View>
              
              <View style={styles.participantsBox}>
                <View style={styles.cameraIconWrapper}>
                  <Ionicons name="videocam" size={18} color="#60a5fa" />
                </View>
                <View>
                  <Text style={styles.participantText}>Seller: {item.seller}</Text>
                  <Text style={styles.participantText}>Buyer: {item.buyer}</Text>
                </View>
              </View>

              <View style={styles.verdictRow}>
                <View style={styles.verdictBadge}>
                  {item.isWinner ? (
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  ) : (
                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                  )}
                  <Text style={styles.verdictText}>Verdict: {item.verdict}</Text>
                </View>
                {item.isWinner && (
                  <Text style={styles.verdictScore}>+22c55e</Text>
                )}
                {!item.isWinner && (
                  <Text style={styles.verdictScoreRed}>#ef4444</Text>
                )}
              </View>

              <Text style={styles.outcomeText}>Outcome: {item.outcome}</Text>
            </View>
          </View>
        ))}
        
        <View style={styles.spacer} />
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    alignItems: 'flex-end',
  },
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c24',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: CloudVoidTheme.colors.textPrimary,
    marginLeft: 8,
    fontSize: 14,
  },
  filterPill: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 12,
    width: 40,
    height: 40,
  },
  filterDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    right: 16,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterOptionText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  groupDate: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  caseCard: {
    backgroundColor: '#1c1c24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    marginBottom: 12,
  },
  caseTitle: {
    color: '#d1d5db',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  caseDate: {
    color: '#6b7280',
    fontSize: 11,
  },
  participantsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cameraIconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  participantText: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 4,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verdictText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  verdictScore: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  verdictScoreRed: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  outcomeText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  spacer: {
    height: 40,
  },
});
