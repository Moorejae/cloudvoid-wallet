import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import AuthBackgroundVideo from '../components/AuthBackgroundVideo';

export default function RegisterScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <AuthBackgroundVideo overlayOpacity={isDesktop ? 0.55 : 0.65}>
      <ScrollView
        contentContainerStyle={[styles.container, isDesktop && styles.desktopContainer]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={16} color="#F8FAFC" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginSwitchBtn}
            onPress={() => navigation.navigate('Login', { mode: 'login' })}
          >
            <Text style={styles.loginSwitchText}>
              Already registered? <Text style={styles.loginSwitchHighlight}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title Header */}
        <View style={styles.titleSection}>
          <View style={styles.badgeRow}>
            <Image
              source={require('../../assets/cloudvoid_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.badgeText}>SOVEREIGN ONBOARDING</Text>
          </View>
          <Text style={styles.title}>Establish Your Void</Text>
          <Text style={styles.subtitle}>
            Choose your cryptographic custody architecture to create or restore keys.
          </Text>
        </View>

        {/* Options Stack */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Smart Account (Passkey) */}
          <TouchableOpacity
            style={[styles.card, styles.smartCard]}
            onPress={() => navigation.navigate('Login', { mode: 'signup' })}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={styles.smartIconCircle}>
                <Ionicons name="finger-print" size={24} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Smart Passkey Account</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>FASTEST</Text>
                  </View>
                </View>
                <Text style={styles.cardSubTitle}>Biometric • Seedless • Cloud Recoverable</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.cardDesc}>
              Instant zero-seed setup. Protected by device secure enclave (FaceID / TouchID) and zero-knowledge encrypted social recovery.
            </Text>
          </TouchableOpacity>

          {/* Card 2: 12-Word Master Vault */}
          <TouchableOpacity
            style={[styles.card, styles.standardCard]}
            onPress={() => navigation.navigate('CreateWallet')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={styles.standardIconCircle}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#F8FAFC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>12-Word Master Vault</Text>
                <Text style={styles.cardSubTitle}>Cold Custody • Offline Mnemonic</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </View>
            <Text style={styles.cardDesc}>
              Generate a cryptographic 12-word recovery seed phrase. Absolute sovereign ownership across BTC, EVM, Solana, Aptos, & TON.
            </Text>
          </TouchableOpacity>

          {/* Card 3: Import Existing Keys */}
          <TouchableOpacity
            style={[styles.card, styles.importCard]}
            onPress={() => navigation.navigate('ImportWallet')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={styles.importIconCircle}>
                <Ionicons name="key-outline" size={24} color="#F8FAFC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Import Existing Keys</Text>
                <Text style={styles.cardSubTitle}>Mnemonic • Private Key • Hardware</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </View>
            <Text style={styles.cardDesc}>
              Restore existing funds from Metamask, Phantom, Ledger, Keystone, or any BIP39 / ed25519 compatible wallet.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Security Badges */}
        <View style={styles.footerGuarantees}>
          <View style={styles.guaranteePill}>
            <Ionicons name="lock-closed" size={12} color="#10B981" />
            <Text style={styles.guaranteeText}>Non-Custodial</Text>
          </View>
          <View style={styles.guaranteePill}>
            <Ionicons name="flash" size={12} color="#8B5CF6" />
            <Text style={styles.guaranteeText}>Zero-Gas Engine</Text>
          </View>
          <View style={styles.guaranteePill}>
            <Ionicons name="globe-outline" size={12} color="#38BDF8" />
            <Text style={styles.guaranteeText}>6 Chains Synced</Text>
          </View>
        </View>
      </ScrollView>
    </AuthBackgroundVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  desktopContainer: {
    maxWidth: 560,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  backText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  loginSwitchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  loginSwitchText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  loginSwitchHighlight: {
    color: '#A78BFA',
    fontWeight: '700',
  },
  titleSection: {
    width: '100%',
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerLogo: {
    width: 26,
    height: 26,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#A78BFA',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 20,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(11, 15, 26, 0.88)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  smartCard: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  standardCard: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  importCard: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  smartIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  standardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  importIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  newBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#060810',
    letterSpacing: 0.5,
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
  },
  footerGuarantees: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  guaranteePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  guaranteeText: {
    fontSize: 11.5,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
