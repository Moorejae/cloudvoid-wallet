import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function LegalDocumentScreen({ navigation, route }: any) {
  const { documentType } = route.params || { documentType: 'terms' };
  
  const isTerms = documentType === 'terms';
  const title = isTerms ? "P2P Terms of Service" : "Merchant Code of Conduct";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isTerms ? (
          <>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By applying for and using the CloudVoid Peer-to-Peer (P2P) Merchant platform, you ("Merchant", "You") agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and CloudVoid ("Platform", "We", "Us").
            </Text>

            <Text style={styles.sectionTitle}>2. Role of CloudVoid</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Matchmaking & Escrow Only:</Text> CloudVoid acts strictly as an intermediary technology platform, providing matchmaking and cryptocurrency escrow services.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Not a Counterparty:</Text> CloudVoid is not a buyer, seller, or counterparty to any fiat-to-crypto transaction. All fiat transactions occur directly between the buyer and seller off-platform.</Text>

            <Text style={styles.sectionTitle}>3. Limitation of Liability & Disclaimers</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>No Liability for Fiat Losses:</Text> CloudVoid is not responsible for any fiat currency losses, bank freezes, or chargebacks incurred as a result of P2P trading. Merchants assume all risks associated with counterparty payments.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>No Guarantees:</Text> CloudVoid does not guarantee the completion of any trade or the honesty of any user on the platform.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Technology Risks:</Text> CloudVoid is not liable for losses resulting from system failures, network congestion, or smart contract vulnerabilities outside of our direct control.</Text>

            <Text style={styles.sectionTitle}>4. Indemnification</Text>
            <Text style={styles.paragraph}>
              You agree to indemnify, defend, and hold harmless CloudVoid, its affiliates, directors, and employees from any and all claims, liabilities, damages, or legal costs arising out of your P2P trading activities, violations of these terms, or disputes with other users.
            </Text>

            <Text style={styles.sectionTitle}>5. Right to Terminate and Revoke</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>At-Will Termination:</Text> CloudVoid reserves the absolute right to terminate, suspend, or revoke your merchant status at any time, for any reason, without prior notice.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Platform Bans & Flagging:</Text> In the event of suspected fraud or misconduct, CloudVoid will freeze your account access, kick you off the platform, and permanently flag your credentials to prevent future verification.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>No Asset Confiscation:</Text> As a decentralized, non-custodial technology provider, CloudVoid does not hold, freeze, or confiscate any user assets (fiat or crypto). Disputes are purely resolved via the decentralized Jury System which controls the multisig release.</Text>

            <Text style={styles.sectionTitle}>6. Taxes and Compliance</Text>
            <Text style={styles.paragraph}>
              Merchants are solely responsible for calculating, reporting, and paying any applicable taxes arising from their P2P trading activities. Merchants must comply with all local laws and regulations regarding cryptocurrency trading and money transmission in their respective jurisdictions.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>1. Operational Integrity & Requirements</Text>
            <Text style={styles.paragraph}>
              To maintain "Trusted Merchant" or verified status on the CloudVoid platform, merchants must adhere to the following strict operational requirements:
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Minimum Trade Volume:</Text> Must maintain a minimum of 200 successful P2P trades.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Completion Rate:</Text> Must maintain a 100% trade completion rate. Unjustified cancellations are strictly prohibited.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Release Time:</Text> Must maintain an average asset release time of under 5 minutes.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Honest Pricing:</Text> Must honor advertised prices, quantities, and minimum/maximum trade limits.</Text>

            <Text style={styles.sectionTitle}>2. Prohibited Activities</Text>
            <Text style={styles.paragraph}>
              Engaging in any of the following activities will result in immediate investigation and potential revocation of merchant status:
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Off-Platform Communication:</Text> All trade-related communication must occur within the official CloudVoid P2P chat. Redirecting users to external channels (e.g., WhatsApp, Telegram) is strictly forbidden.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Third-Party Payments:</Text> Merchants must use payment accounts that match their verified platform identity. Accepting or sending payments via third-party accounts is a severe violation.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Market Manipulation:</Text> Attempting to manipulate market prices, coordinating trades to induce others, or posting deceptive advertisements.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Fraudulent Chargebacks:</Text> Attempting to profit from chargebacks, refunds, or falsified payment documentation.</Text>

            <Text style={styles.sectionTitle}>3. Dispute Resolution & The Jury System</Text>
            <Text style={styles.listItem}>• Merchants must fully cooperate during arbitration and provide requested evidence promptly.</Text>
            <Text style={styles.listItem}>• Merchants are required to respect the verdicts delivered by the decentralized CloudVoid Jury System. Continued circumvention or repeated disputes will result in a permanent ban.</Text>

            <Text style={styles.sectionTitle}>4. Sanctions & Consequences</Text>
            <Text style={styles.paragraph}>
              CloudVoid defines misconduct broadly to protect the ecosystem. Standard penalties for violating this Code of Conduct include:
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Immediate Revocation:</Text> Loss of "Pro Merchant" or "Trusted Merchant" status.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Account Bans & Flagging:</Text> Permanent bans from the CloudVoid platform and flagging of identity to prevent the creation of new accounts.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>No Asset Confiscation:</Text> CloudVoid does not hold or freeze merchant assets. The platform relies exclusively on the decentralized Jury System to resolve disputes and release funds held in multisig escrow.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Legal Action:</Text> CloudVoid reserves the right to report serious misconduct or fraud to local law enforcement authorities.</Text>
          </>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#0b0b0e',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
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
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
  boldText: {
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  bottomSpacer: {
    height: 60,
  },
});
