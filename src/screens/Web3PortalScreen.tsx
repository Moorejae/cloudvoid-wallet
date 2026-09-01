import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { fetchAllDApps, fetchTrendingTokens, DApp, TrendingToken } from '../services/web3Api';

const ACTION_CARDS = [
  {
    id: 'wallet',
    title: 'Wallet Router',
    description: 'Local wallet actions, balances, backups, and transfers.',
    icon: 'wallet-outline',
    color: '#8B5CF6',
    route: 'Wallet'
  },
  {
    id: 'swap',
    title: 'Swap',
    description: 'Real DEX-aggregated swaps (ParaSwap) on Ethereum.',
    icon: 'swap-horizontal-outline',
    color: '#10B981',
    route: 'Swap'
  },
  {
    id: 'dapps',
    title: 'dApps & DeFi',
    description: 'Browse DEX, lending, yield and staking protocols.',
    icon: 'server-outline',
    color: '#F59E0B',
    route: 'DApps'
  },
  {
    id: 'memecoins',
    title: 'Memecoin Trading',
    description: 'Live meme-coin prices, new listings and instant swap.',
    icon: 'flame-outline',
    color: '#EC4899',
    route: 'CryptoTrading'
  },
  {
    id: 'backup',
    title: 'Secure Backup',
    description: 'Export or restore your recovery phrase backup file.',
    icon: 'shield-checkmark-outline',
    color: '#3B99FC',
    route: 'CloudBackup'
  },
];

const DAPP_CATEGORIES = ['DEX', 'Lending', 'Yield', 'Staking', 'Predictions', 'NFTs'];

export default function Web3PortalScreen() {
  const navigation = useNavigation<any>();
  const [memecoins, setMemecoins] = useState<TrendingToken[]>([]);
  const [dapps, setDapps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [coins, all] = await Promise.all([fetchTrendingTokens(), fetchAllDApps()]);
        if (!mounted) return;
        if (coins && coins.length) setMemecoins(coins.slice(0, 8));
        if (all && all.length) setDapps(all);
      } catch {
        // keep empty state
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const featuredDapps = dapps.slice(0, 10);
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Web3 Portal</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CryptoTrading')} style={styles.tradeChip}>
          <Ionicons name="flame-outline" size={14} color="#EC4899" />
          <Text style={styles.tradeChipText}>Trade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Local self-custody Web3 tools — dApps, DeFi and meme-coin trading, all without WalletConnect.
        </Text>

        {/* Action grid */}
        <View style={styles.grid}>
          {ACTION_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={() => navigation.navigate(card.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                <Ionicons name={card.icon as any} size={26} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Memecoins */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Memecoins</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CryptoTrading')}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color="#EC4899" style={{ marginVertical: 16 }} />
        ) : memecoins.length === 0 ? (
          <Text style={styles.emptyText}>No memecoins available right now.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {memecoins.map((token, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.tokenCard}
                onPress={() => navigation.navigate('CryptoTrading')}
              >
                <Image source={{ uri: token.icon }} style={styles.tokenIcon} />
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                <Text style={styles.tokenPrice}>${token.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</Text>
                <Text style={[styles.tokenChange, { color: token.change24h >= 0 ? '#00D395' : '#FF4242' }]}>
                  {token.change24h >= 0 ? '+' : ''}{(token.change24h ?? 0).toFixed(2)}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* DApps & DeFi */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>dApps & DeFi</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DApps')}>
            <Text style={styles.sectionLink}>Browse</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {DAPP_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={styles.catPill} onPress={() => navigation.navigate('DApps')}>
              <Text style={styles.catPillText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#F59E0B" style={{ marginVertical: 16 }} />
        ) : featuredDapps.length === 0 ? (
          <Text style={styles.emptyText}>Connect the backend server to load dApps.</Text>
        ) : (
          featuredDapps.map((dapp, idx) => (
            <TouchableOpacity
              key={`${dapp.name}-${idx}`}
              style={styles.dappRow}
              onPress={() => navigation.navigate('DAppDetail', { appId: dapp.name })}
            >
              <Image source={{ uri: dapp.icon }} style={styles.dappIcon} />
              <View style={styles.dappMeta}>
                <Text style={styles.dappName}>{dapp.name}</Text>
                <Text style={styles.dappDesc} numberOfLines={1}>{dapp.description}</Text>
              </View>
              <View style={styles.dappCat}>
                <Text style={styles.dappCatText}>{dapp.category}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {isWeb && (
          <TouchableOpacity style={styles.walletRow} onPress={() => navigation.navigate('Wallet')}>
            <Ionicons name="wallet-outline" size={18} color="#8B5CF6" />
            <Text style={styles.walletRowText}>Go to your Wallet dashboard</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050514' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 24 : 60, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  tradeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
    backgroundColor: 'rgba(236,72,153,0.12)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.35)',
  },
  tradeChipText: { color: '#EC4899', fontSize: 13, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  subtitle: {
    color: CloudVoidTheme.colors.textSecondary, fontSize: 15, marginBottom: 20, lineHeight: 22,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  card: {
    width: '48%', flexGrow: 1,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardDesc: { color: CloudVoidTheme.colors.textSecondary, fontSize: 13, lineHeight: 18 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 24, marginBottom: 14,
  },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sectionLink: { color: '#3B99FC', fontSize: 13, fontWeight: '600' },
  horizontalList: { gap: 10, paddingRight: 8 },
  tokenCard: {
    width: 120, backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  tokenIcon: { width: 32, height: 32, borderRadius: 8, marginBottom: 8 },
  tokenSymbol: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  tokenPrice: { color: CloudVoidTheme.colors.textSecondary, fontSize: 12, marginBottom: 2 },
  tokenChange: { fontSize: 12, fontWeight: '700' },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  catPillText: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },
  dappRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  dappIcon: { width: 36, height: 36, borderRadius: 9, marginRight: 12 },
  dappMeta: { flex: 1, marginRight: 8 },
  dappName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  dappDesc: { color: CloudVoidTheme.colors.textSecondary, fontSize: 12 },
  dappCat: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100,
    backgroundColor: 'rgba(59,153,252,0.12)',
  },
  dappCatText: { color: '#3B99FC', fontSize: 10, fontWeight: '700' },
  emptyText: { color: CloudVoidTheme.colors.textSecondary, fontSize: 14, marginVertical: 8 },
  walletRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 12, padding: 14, marginTop: 20,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  walletRowText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
});

