import React, { useState, useEffect, useRef } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ArbitrationRequestScreen({ navigation, route }: any) {
  const {
    caseRef = '#9B...7C',
    merchant = 'GlobalGoods',
    disputeType = 'Funds Reversal',
    caseStatus = 'Ongoing',
    tradeAmount = '250 USDT',
  } = route?.params || {};

  const [selectedVote, setSelectedVote] = useState<'buyer' | 'seller' | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Countdown timer for arbitration deadline
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 48, seconds: 35 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = () => {
    const h = String(timeLeft.hours).padStart(2, '0');
    const m = String(timeLeft.minutes).padStart(2, '0');
    const s = String(timeLeft.seconds).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Arbitration Request: [Case {caseRef}]</Text>
        <TouchableOpacity style={styles.headerBtnRight} onPress={() => setShowHelp(true)}>
          <Ionicons name="help-circle-outline" size={22} color="#a78bfa" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Urgent Badge */}
        <View style={styles.urgentBadgeRow}>
          <View style={styles.urgentBadge}>
            <Ionicons name="warning" size={12} color={CloudVoidTheme.colors.textPrimary} />
            <Text style={styles.urgentBadgeText}>Urgent Case</Text>
          </View>
        </View>

        {/* Dispute Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.hammerContainer}>
            <Ionicons name="hammer" size={32} color="#a78bfa" style={styles.summaryIcon} />
            <View style={styles.soundingBlock} />
          </View>
          <Text style={styles.summaryTitle}>Disputed P2P Trade: {tradeAmount}</Text>
          <Text style={styles.summaryDetail}>Seller: Seller (Anonymous)</Text>
          <Text style={styles.summaryDetail}>Buyer: Buyer (Anonymous)</Text>
          <View style={styles.summaryDivider} />
          <View style={styles.deadlineRow}>
            <Ionicons name="warning" size={14} color="#fbbf24" />
            <Text style={styles.deadlineText}>Dispute Overall: Expires in, 69:45 mins</Text>
          </View>
          <View style={styles.deadlineCountdown}>
            <Text style={styles.deadlineCountdownText}>
              ARBITRATION DEADLINE: ~ 2 Hours ({formatTime()} remains)
            </Text>
          </View>
        </View>

        {/* Anonymized Evidence Locker */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Anonymized Evidence Locker</Text>
            <Ionicons name="lock-closed" size={16} color="#9ca3af" />
          </View>

          <TouchableOpacity 
            style={styles.evidenceItem}
            onPress={() => navigation.navigate('ActiveTradeChat', { readOnly: true, anonymize: true })}
          >
            <Ionicons name="document-text" size={18} color="#60a5fa" />
            <Text style={styles.evidenceText}>Buyer's Initial Claim Text</Text>
            <View style={styles.readOnlyBadge}>
              <Ionicons name="eye" size={12} color="#9ca3af" />
              <Text style={styles.readOnlyBadgeText}>Read Only</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.evidenceItem}
            onPress={() => navigation.navigate('ActiveTradeChat', { readOnly: true, anonymize: true })}
          >
            <Ionicons name="document-text" size={18} color="#a78bfa" />
            <Text style={styles.evidenceText}>Seller's Response Text</Text>
            <View style={styles.readOnlyBadge}>
              <Ionicons name="eye" size={12} color="#9ca3af" />
              <Text style={styles.readOnlyBadgeText}>Read Only</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.evidenceItem}>
            <Ionicons name="videocam" size={18} color="#60a5fa" />
            <Text style={styles.evidenceText} numberOfLines={1}>Screen Recording (Buyer Ledger)</Text>
            <TouchableOpacity style={styles.streamBadge} onPress={() => Linking.openURL('https://youtube.com')}>
              <Ionicons name="logo-youtube" size={12} color={CloudVoidTheme.colors.textPrimary} style={{marginRight: 4}} />
              <Text style={styles.streamBadgeText}>Stream</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.evidenceItem}>
            <Ionicons name="videocam" size={18} color="#a78bfa" />
            <Text style={styles.evidenceText} numberOfLines={1}>Screen Recording (Seller Ledger)</Text>
            <TouchableOpacity style={styles.streamBadge} onPress={() => Linking.openURL('https://youtube.com')}>
              <Ionicons name="logo-youtube" size={12} color={CloudVoidTheme.colors.textPrimary} style={{marginRight: 4}} />
              <Text style={styles.streamBadgeText}>Stream</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>Upload Additional Evidence (Forensic Only)</Text>
          </TouchableOpacity>
        </View>

        {/* Your Binding Arbitration Vote */}
        <View style={styles.section}>
          <Text style={styles.voteSectionTitle}>Your Binding Arbitration Vote</Text>

          {/* Vote Progress */}
          <View style={styles.voteProgressContainer}>
            <View style={styles.voteProgressBar}>
              <View style={[styles.voteProgressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.voteProgressText}>Votes: 2 / 5 Required Majority</Text>
          </View>

          {/* Vote Buttons */}
          <View style={styles.voteButtonsRow}>
            <TouchableOpacity
              style={[
                styles.voteBtn,
                selectedVote === 'seller' ? styles.voteBtnUnselected : styles.voteBtnBuyer,
                selectedVote === 'buyer' && styles.voteBtnSelected,
              ]}
              onPress={() => setSelectedVote('buyer')}
            >
              <Text style={[styles.voteBtnText, selectedVote === 'seller' && styles.voteBtnTextUnselected]}>Vote for Buyer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.voteBtn,
                selectedVote === 'buyer' ? styles.voteBtnUnselected : styles.voteBtnSeller,
                selectedVote === 'seller' && styles.voteBtnSelected,
              ]}
              onPress={() => setSelectedVote('seller')}
            >
              <Text style={[styles.voteBtnText, selectedVote === 'buyer' && styles.voteBtnTextUnselected]}>Vote for Seller</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Fixed Bottom Confirm Button */}
      <View style={styles.bottomFixedContainer}>
        <TouchableOpacity
          style={[styles.confirmVoteBtn, !selectedVote && styles.confirmVoteBtnDisabled]}
          disabled={!selectedVote}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="checkmark-circle" size={18} color={selectedVote ? CloudVoidTheme.colors.btnText : '#9ca3af'} />
          <Text style={[styles.confirmVoteText, !selectedVote && styles.confirmVoteTextDisabled]}>
            Confirm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Instructions Modal */}
      <Modal
        visible={showHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <TouchableOpacity
          style={styles.helpModalOverlay}
          activeOpacity={1}
          onPress={() => setShowHelp(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.helpModalSheet}>
            <View style={styles.helpModalHandle} />
            <View style={styles.helpModalIconRow}>
              <Ionicons name="shield-checkmark" size={36} color="#a78bfa" />
            </View>
            <Text style={styles.helpModalTitle}>Jury Due Diligence & Rules</Text>

            <View style={styles.helpGuidelineItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.helpGuidelineText}>Review all evidence carefully before casting your vote. Read both the buyer's claim and the seller's response in full.</Text>
            </View>

            <View style={styles.helpGuidelineItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.helpGuidelineText}>Investigate clearly using the evidence provided. Watch both screen recordings to verify transaction facts so you don't make the wrong decision.</Text>
            </View>

            <View style={styles.helpGuidelineItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.helpGuidelineText}>Be truthful and impartial. Do not vote based on personal bias. Your vote is binding and anonymous.</Text>
            </View>

            <View style={styles.helpGuidelineItem}>
              <Ionicons name="warning" size={18} color="#fbbf24" />
              <Text style={styles.helpGuidelineText}>Dishonest or careless voting may result in loss of jury points and removal from the jury pool. The AI randomly selects 5 independent merchants to vote. You will never be selected to judge a case you are involved in.</Text>
            </View>

            <TouchableOpacity style={styles.helpDismissBtn} onPress={() => setShowHelp(false)}>
              <Text style={styles.helpDismissBtnText}>I Understand</Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  backText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  headerBtnRight: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  helpText: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Urgent Badge
  urgentBadgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  urgentBadgeText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#1c1c24',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hammerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    marginBottom: 0,
  },
  soundingBlock: {
    width: 24,
    height: 6,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 2,
    marginTop: -4,
  },
  summaryTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryDetail: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 2,
  },
  summaryDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  deadlineText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  deadlineCountdown: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: '100%',
  },
  deadlineCountdownText: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },

  // Evidence Items
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 10,
  },
  evidenceText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  streamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cc0000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  streamBadgeText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  uploadBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  uploadBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },

  // Vote Section
  voteSectionTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  voteProgressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  voteProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  voteProgressFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 3,
  },
  voteProgressText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },

  // Vote Buttons
  voteButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  voteBtnBuyer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
  },
  voteBtnSeller: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
  },
  voteBtnSelected: {
    borderWidth: 3,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  voteBtnUnselected: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    opacity: 0.4,
  },
  voteBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  voteBtnTextUnselected: {
    color: '#9ca3af',
  },

  // Confirm
  bottomFixedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#1c1c24',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  confirmVoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 100, // pill shape
  },
  confirmVoteBtnDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmVoteText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmVoteTextDisabled: {
    color: '#9ca3af',
  },
  spacer: {
    height: 40,
  },

  // Read-only badge
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  readOnlyBadgeText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
  },

  // Help Modal
  helpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  helpModalSheet: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  helpModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  helpModalIconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  helpModalTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  helpGuidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  helpGuidelineText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  helpDismissBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  helpDismissBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
