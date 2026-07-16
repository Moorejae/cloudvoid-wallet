import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function LegalDocumentScreen({ navigation, route }: any) {
  const { documentType } = route.params || { documentType: 'terms' };
  
  const isTerms = documentType === 'terms';
  const title = isTerms ? "Wallet Terms of Service" : "Wallet Code of Conduct";

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
              By using the CloudVoid Wallet, you ("User", "You") agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and CloudVoid ("Platform", "We", "Us").
            </Text>

            <Text style={styles.sectionTitle}>2. Role of CloudVoid</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Non-Custodial Wallet:</Text> CloudVoid is a decentralized, non-custodial wallet interface. We do not hold, control, or have access to your private keys, seed phrases, or funds.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Self-Custody Responsibility:</Text> You are entirely responsible for securing your own seed phrase and private keys. Loss of these credentials means permanent loss of your funds.</Text>

            <Text style={styles.sectionTitle}>3. Limitation of Liability & Disclaimers</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>No Liability for Losses:</Text> CloudVoid is not responsible for any financial losses, hacks, phishing attempts, or user errors resulting in the loss of crypto assets.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Technology Risks:</Text> CloudVoid is not liable for losses resulting from system failures, network congestion, or smart contract vulnerabilities outside of our direct control.</Text>

            <Text style={styles.sectionTitle}>4. Taxes and Compliance</Text>
            <Text style={styles.paragraph}>
              Users are solely responsible for calculating, reporting, and paying any applicable taxes arising from their transactions. Users must comply with all local laws and regulations regarding cryptocurrency usage in their respective jurisdictions.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>1. Prohibited Activities</Text>
            <Text style={styles.paragraph}>
              Engaging in any of the following activities through our interface is strictly prohibited:
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Illegal Activities:</Text> Using the wallet to facilitate money laundering, terrorist financing, or any other illegal activities.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Malicious Exploits:</Text> Attempting to reverse-engineer the wallet interface, inject malicious code, or exploit vulnerabilities.</Text>
            
            <Text style={styles.sectionTitle}>2. Platform Integrity</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>No Asset Confiscation:</Text> CloudVoid does not hold or freeze user assets. We have no technical capability to freeze your on-chain assets or recover funds if you send them to the wrong address.</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Open Source Reliance:</Text> The platform utilizes open-source blockchain infrastructure. You acknowledge that blockchain transactions are irreversible.</Text>

            <Text style={styles.sectionTitle}>3. Changes to the Code of Conduct</Text>
            <Text style={styles.paragraph}>
              CloudVoid reserves the right to update this Code of Conduct at any time. Continued use of the wallet implies acceptance of the revised policies.
            </Text>
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
