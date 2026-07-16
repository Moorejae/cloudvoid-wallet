import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { fetchAffiliateLinks } from '../services/web3Api';
import { useWalletStore } from '../stores/walletStore';

interface ProviderItem {
  id: string;
  name: string;
  type: string;
  description: string;
  feeInfo: string;
  speed: string;
  icon: string;
  color: string;
}

const PROVIDERS: ProviderItem[] = [
  { id: 'onramper', name: 'Onramper Aggregator', type: 'Aggregator', description: 'Routes dynamically to the cheapest provider. Best rates globally.', feeInfo: '0.8% platform fee + provider fee', speed: '⚡ Instant (~2 min)', icon: 'globe', color: '#3B99FC' },
  { id: 'moonpay', name: 'MoonPay', type: 'Direct Partner', description: 'Quick credit card or Apple/Google Pay purchase with global coverage.', feeInfo: '3.5% card fee', speed: '⚡ Instant (~3 min)', icon: 'logo-bitcoin', color: '#00D395' },
  { id: 'coinbase', name: 'Coinbase Pay', type: 'Direct Partner', description: 'Direct integration with your Coinbase account balances & low bank transfer fees.', feeInfo: '2.9% fee', speed: '⚡ Instant (~1 min)', icon: 'logo-usd', color: '#f59e0b' },
  { id: 'transak', name: 'Transak', type: 'Direct Partner', description: 'Supports cards, SEPA bank transfers, and regional payment methods like UPI.', feeInfo: '1.5% - 3.5% fee', speed: '🕒 2-10 min depending on method', icon: 'wallet-outline', color: '#8b5cf6' },
  { id: 'ramp', name: 'Ramp Network', type: 'Direct Partner', description: 'Optimized banking rails in US/EU with fast processing and low card fees.', feeInfo: '1.9% - 2.9% fee', speed: '⚡ Instant (~2 min)', icon: 'rocket-outline', color: '#ec4899' },
];

export default function FiatOnRampScreen({ route, navigation }: any) {
  const token = route?.params?.token;
  const wallets = useWalletStore((state) => state.wallets);
  const activeWallet = wallets[0];
  const walletAddress = activeWallet?.address || '';
  const symbol = token?.symbol || 'USDT';

  const [links, setLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLinks() {
      const res = await fetchAffiliateLinks(walletAddress, symbol);
      if (res) {
        setLinks(res);
      } else {
        // Fallback default links
        setLinks({
          moonpay: `https://buy.moonpay.com?apiKey=pk_live_mock_key&currency=${symbol.toLowerCase()}&walletAddress=${walletAddress}`,
          coinbase: `https://pay.coinbase.com/buy/select-asset?appId=mock_app_id&destinationWalletAddress=${walletAddress}&cryptoCurrency=${symbol}`,
          transak: `https://global.transak.com?apiKey=mock_api_key&cryptoCurrencyCode=${symbol}&walletAddress=${walletAddress}`,
          ramp: `https://ramp.network/buy?hostApiKey=mock_ramp_key&defaultAsset=${symbol}&userAddress=${walletAddress}`,
          onramper: `https://widget.onramper.com?apiKey=mock_onramper_key&defaultCrypto=${symbol}&wallets=${symbol}:${walletAddress}`
        });
      }
      setLoading(false);
    }
    loadLinks();
  }, [walletAddress, symbol]);

  const handleBuy = (providerId: string) => {
    const url = links[providerId];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Failed to open URL in browser.');
      });
    } else {
      Alert.alert('Error', 'Provider link not available.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Crypto via On-Ramps</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CloudVoidTheme.colors.accent} />
          <Text style={styles.loadingText}>Syncing affiliate channels...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.desc}>
            CloudVoid partners with the leading fiat-to-crypto gateways. Tap a provider to purchase crypto safely using your credit card or bank transfer.
          </Text>

          {PROVIDERS.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: provider.color + '20' }]}>
                  <Ionicons name={provider.icon as any} size={24} color={provider.color} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerType}>{provider.type}</Text>
                </View>
              </View>

              <Text style={styles.providerDesc}>{provider.description}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.infoText}>{provider.feeInfo}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.infoText}>{provider.speed}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.buyBtn, { backgroundColor: provider.color }]} 
                onPress={() => handleBuy(provider.id)}
              >
                <Text style={styles.buyBtnText}>Purchase using {provider.name}</Text>
                <Ionicons name="open-outline" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050514',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  desc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  providerCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  providerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  providerType: {
    color: CloudVoidTheme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  providerDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 12,
    padding: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  }
});
