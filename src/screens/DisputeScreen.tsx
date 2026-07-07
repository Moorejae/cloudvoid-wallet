import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import DoubleConfirmModal from '../components/DoubleConfirmModal';

export default function DisputeScreen({ route, navigation }: any) {
  const { orderId = 'ord_default' } = route.params || {};
  
  const userId = useWalletStore((state) => state.userId);
  const trustPoints = useWalletStore((state) => state.trustPoints);

  const [votesBuyer, setVotesBuyer] = useState(1);
  const [votesSeller, setVotesSeller] = useState(1);
  const [jurorsVoted, setJurorsVoted] = useState<string[]>([]);
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [voteTarget, setVoteTarget] = useState<'buyer' | 'seller' | null>(null);

  // Check if current user is eligible to act as a juror (trustPoints > 110)
  const isJurorEligible = trustPoints > 110;

  useEffect(() => {
    // Poll for jury votes periodically
    const interval = setInterval(() => {
      // Mock random vote increments by other jurors
      if (votesBuyer < 3 && votesSeller < 3) {
        if (Math.random() > 0.6) {
          if (Math.random() > 0.5) {
            setVotesBuyer((v) => v + 1);
          } else {
            setVotesSeller((v) => v + 1);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [votesBuyer, votesSeller]);

  // Check if resolution has been met (3 of 5 majority)
  useEffect(() => {
    if (votesBuyer >= 3) {
      Alert.alert('Verdict Reached', 'Jury decided in favor of the Buyer (3/5 majority). Escrow has been released.');
      navigation.popToTop();
    } else if (votesSeller >= 3) {
      Alert.alert('Verdict Reached', 'Jury decided in favor of the Seller (3/5 majority). Escrow has been refunded.');
      navigation.popToTop();
    }
  }, [votesBuyer, votesSeller]);

  const handleCastVote = (target: 'buyer' | 'seller') => {
    setVoteTarget(target);
    setIsVoteOpen(true);
  };

  const handleConfirmVote = async () => {
    setIsVoteOpen(false);
    if (!voteTarget) return;

    try {
      const res = await fetch('http://localhost:8000/api/p2p/jury/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          juror_id: userId,
          vote_for_buyer: voteTarget === 'buyer',
          signature: '0xMockSignature'
        })
      });
      
      if (res.ok) {
        if (voteTarget === 'buyer') {
          setVotesBuyer((v) => v + 1);
        } else {
          setVotesSeller((v) => v + 1);
        }
        setJurorsVoted([...jurorsVoted, userId || '']);
        Alert.alert('Vote Cast', `Your vote has been cast successfully for the ${voteTarget}.`);
      }
    } catch (e) {
      // Offline fallback
      if (voteTarget === 'buyer') {
        setVotesBuyer((v) => v + 1);
      } else {
        setVotesSeller((v) => v + 1);
      }
      setJurorsVoted([...jurorsVoted, userId || '']);
      Alert.alert('Vote Cast', `Your vote has been cast successfully for the ${voteTarget}.`);
    }
  };

  const alreadyVoted = jurorsVoted.includes(userId || '');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Jury Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Dispute Status</Text>
          <Text style={styles.statusTitle}>Jury Deliberation Active</Text>
          <Text style={styles.statusDesc}>
            Arbitration panel is evaluating bank transfer evidence logs and chat transcripts.
          </Text>
        </View>

        {/* Vote Counts */}
        <View style={styles.votesCard}>
          <Text style={styles.votesCardTitle}>Jury Vote Progress (First to 3 Wins)</Text>
          
          <View style={styles.voteColumns}>
            <View style={styles.voteCol}>
              <Text style={styles.voteColLabel}>Votes for Buyer</Text>
              <Text style={styles.voteCountText}>{votesBuyer} / 3</Text>
              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(votesBuyer / 3) * 100}%`, backgroundColor: CloudVoidTheme.colors.success }]} />
              </View>
            </View>

            <View style={styles.voteCol}>
              <Text style={styles.voteColLabel}>Votes for Seller</Text>
              <Text style={styles.voteCountText}>{votesSeller} / 3</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(votesSeller / 3) * 100}%`, backgroundColor: CloudVoidTheme.colors.accent }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Evidence Log */}
        <View style={styles.evidenceCard}>
          <Text style={styles.evidenceHeader}>Submitted Evidence logs</Text>
          <View style={styles.evidenceItem}>
            <Text style={styles.evidenceMeta}>Buyer • 5 min ago</Text>
            <Text style={styles.evidenceText}>Uploaded: "Receipt_Zenith_Transfer.pdf" (attestation payload signed)</Text>
          </View>
          <View style={styles.evidenceItem}>
            <Text style={styles.evidenceMeta}>Seller • 2 min ago</Text>
            <Text style={styles.evidenceText}>Attestation: "Access Bank Account statements" (cleared balance: ₦0.00)</Text>
          </View>
        </View>

        {/* Juror Controls */}
        {isJurorEligible && !alreadyVoted && (
          <View style={styles.jurorBox}>
            <Text style={styles.jurorTitle}>🛡️ Admin Juror Panel</Text>
            <Text style={styles.jurorDesc}>
              Your P2P trust score is high. You have been selected as a blind juror. Select your verdict below:
            </Text>
            
            <View style={styles.jurorBtnRow}>
              <TouchableOpacity 
                style={[styles.jurorBtn, { borderColor: CloudVoidTheme.colors.success }]}
                onPress={() => handleCastVote('buyer')}
              >
                <Text style={[styles.jurorBtnText, { color: CloudVoidTheme.colors.success }]}>Vote Buyer</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.jurorBtn, { borderColor: CloudVoidTheme.colors.accent }]}
                onPress={() => handleCastVote('seller')}
              >
                <Text style={[styles.jurorBtnText, { color: CloudVoidTheme.colors.accentGlow }]}>Vote Seller</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {alreadyVoted && (
          <Text style={styles.votedLabel}>✓ You have cast your juror vote for this dispute.</Text>
        )}

        {!isJurorEligible && (
          <Text style={styles.nonJurorLabel}>
            Blind justice: Jurors are anonymously matched based on trust metrics.
          </Text>
        )}
      </ScrollView>

      {/* Double confirm Modal */}
      <DoubleConfirmModal
        isOpen={isVoteOpen}
        onClose={() => setIsVoteOpen(false)}
        onConfirm={handleConfirmVote}
        title="Confirm Juror Verdict"
        message={`You are about to cast your official blind vote in favor of the ${voteTarget}. Fraudulent votes will result in trust point wipes.`}
        confirmText="Confirm Vote"
        confirmBg={voteTarget === 'buyer' ? CloudVoidTheme.colors.success : CloudVoidTheme.colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  statusCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CloudVoidTheme.colors.danger,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 18,
  },
  votesCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 16,
    padding: 16,
  },
  votesCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  voteColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteCol: {
    flex: 0.46,
  },
  voteColLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 6,
  },
  voteCountText: {
    fontSize: 24,
    fontWeight: '800',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  evidenceCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 16,
    padding: 16,
  },
  evidenceHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  evidenceItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    paddingBottom: 8,
  },
  evidenceMeta: {
    fontSize: 11,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textPrimary,
    lineHeight: 18,
  },
  jurorBox: {
    backgroundColor: 'rgba(139,92,246,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  jurorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CloudVoidTheme.colors.accentGlow,
  },
  jurorDesc: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 18,
  },
  jurorBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  jurorBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jurorBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  votedLabel: {
    fontSize: 13,
    color: CloudVoidTheme.colors.success,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  nonJurorLabel: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
});
