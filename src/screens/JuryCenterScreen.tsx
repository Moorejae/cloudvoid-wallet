import React from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JURY_CASES = [
  {
    id: 1,
    disputeId: 'dsp...001',
    caseRef: '#9B...7C',
    merchant: 'GlobalGoods',
    disputeType: 'Funds Reversal',
    caseStatus: 'Ongoing',
    currentVote: 'N/A',
    tradeAmount: '250 USDT',
  },
  {
    id: 2,
    disputeId: 'dsp...002',
    caseRef: '#4D...2A',
    merchant: 'TechHub',
    disputeType: 'Item not received',
    caseStatus: 'Pending',
    currentVote: 'N/A',
    tradeAmount: '180 USDT',
  },
  {
    id: 3,
    disputeId: 'dsp...003',
    caseRef: '#7F...5E',
    merchant: 'SolarCo',
    disputeType: 'Incorrect service',
    caseStatus: 'Open',
    currentVote: 'N/A',
    tradeAmount: '320 USDT',
  },
];

export default function JuryCenterScreen({ navigation }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return '#f59e0b';
      case 'Pending': return '#60a5fa';
      case 'Open': return '#22c55e';
      default: return '#9ca3af';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jury Center</Text>
        <View style={styles.headerBtnRight}>
          <View style={styles.scoreBadge}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.scoreText}>114/120</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Jury Cases Header */}
        <Text style={styles.sectionLabel}>Active Jury Cases (Total {JURY_CASES.length})</Text>

        {JURY_CASES.map((juryCase) => (
          <TouchableOpacity
            key={juryCase.id}
            style={styles.caseCard}
            onPress={() => navigation.navigate('ArbitrationRequest', {
              caseRef: juryCase.caseRef,
              merchant: juryCase.merchant,
              disputeType: juryCase.disputeType,
              caseStatus: juryCase.caseStatus,
              tradeAmount: juryCase.tradeAmount,
              disputeId: juryCase.disputeId,
            })}
          >
            <View style={styles.caseCardHeader}>
              <View style={styles.hammerContainer}>
                <Ionicons name="hammer" size={22} color="#a78bfa" />
                <View style={styles.soundingBlockSmall} />
              </View>
              <View style={styles.caseCardTitleRow}>
                <Text style={styles.caseCardTitle}>Active Jury Case {juryCase.id}</Text>
                <Text style={styles.caseCardDispId}>{juryCase.disputeId}</Text>
              </View>
            </View>

            <View style={styles.caseDetailRows}>
              <View style={styles.caseDetailRow}>
                <Text style={styles.caseDetailLabel}>Merchant:</Text>
                <Text style={styles.caseDetailValue}>{juryCase.merchant}</Text>
              </View>
              <View style={styles.caseDetailRow}>
                <Text style={styles.caseDetailLabel}>Dispute Type:</Text>
                <Text style={styles.caseDetailValue}>{juryCase.disputeType}</Text>
              </View>
              <View style={styles.caseDetailRow}>
                <Text style={styles.caseDetailLabel}>Case Status:</Text>
                <Text style={[styles.caseDetailValue, { color: getStatusColor(juryCase.caseStatus) }]}>
                  {juryCase.caseStatus}
                </Text>
              </View>
              <View style={styles.caseDetailRow}>
                <Text style={styles.caseDetailLabel}>Current Vote:</Text>
                <Text style={[styles.caseDetailValue, { color: '#9ca3af', fontStyle: 'italic' }]}>
                  {juryCase.currentVote}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 4,
  },
  scoreText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  caseCard: {
    backgroundColor: '#1c1c24',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  caseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  hammerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundingBlockSmall: {
    width: 16,
    height: 4,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 2,
    marginTop: -2,
  },
  caseCardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseCardTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
  },
  caseCardDispId: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  caseDetailRows: {
    gap: 8,
  },
  caseDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseDetailLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  caseDetailValue: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
  },
  spacer: {
    height: 120,
  },
});
