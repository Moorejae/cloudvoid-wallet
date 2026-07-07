import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { useWalletConnectStore } from '../stores/walletConnectStore';
import { fetchDAppsByCategory, DApp } from '../services/web3Api';
import Svg, { Path, Circle } from 'react-native-svg';

const CATEGORIES = ['DEX', 'Lending', 'Yield', 'Staking', 'Predictions', 'NFTs', 'Games', 'AI & Bots', 'Bridge'];

const CATEGORY_ICONS: Record<string, string> = {
  'DEX': 'swap-horizontal',
  'Lending': 'cash-outline',
  'Yield': 'trending-up',
  'Staking': 'layers-outline',
  'Predictions': 'dice-outline',
  'NFTs': 'images-outline',
  'Games': 'game-controller-outline',
  'AI & Bots': 'hardware-chip-outline',
  'Bridge': 'git-network-outline',
};

export default function DAppsScreen() {
  const [activeCategory, setActiveCategory] = useState('DEX');
  const [searchQuery, setSearchQuery] = useState('');
  const [dapps, setDapps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigation = useNavigation<any>();
  const sessions = useWalletConnectStore(state => state.sessions);

  const loadDApps = useCallback(async (category: string) => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchDAppsByCategory(category);
      setDapps(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDApps(activeCategory);
  }, [activeCategory, loadDApps]);

  const filteredDapps = searchQuery
    ? dapps.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : dapps;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8, padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>dApps</Text>
        </View>
        <TouchableOpacity style={styles.wcButton} onPress={() => navigation.navigate('WalletConnectScanner')}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M5.5 9.5C9.08985 5.91015 14.9101 5.91015 18.5 9.5L20.25 11.25L17.5 14L15.75 12.25C13.6789 10.1789 10.3211 10.1789 8.25 12.25L6.5 14L3.75 11.25L5.5 9.5Z" fill="#3B99FC"/>
            <Path d="M11 17L12 18L15.5 14.5L14.5 13.5L11 17Z" fill="#3B99FC"/>
            <Path d="M13 17L12 18L8.5 14.5L9.5 13.5L13 17Z" fill="#3B99FC"/>
          </Svg>
          {sessions.length > 0 && (
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeText}>{sessions.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.3)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dApps..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Category Pills */}
      <View style={styles.pillsOuter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, activeCategory === cat && styles.pillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Ionicons
                name={(CATEGORY_ICONS[cat] || 'ellipse-outline') as any}
                size={14}
                color={activeCategory === cat ? '#3B99FC' : 'rgba(255,255,255,0.4)'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* dApps List */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#3B99FC" />
          <Text style={styles.stateText}>Loading {activeCategory} dApps...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={styles.stateText}>Failed to load dApps</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadDApps(activeCategory)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDapps}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateText}>No dApps found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('DAppDetail', { appId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Image source={{ uri: item.icon }} style={styles.dappIcon} />
              </View>
              <View style={styles.dappDetails}>
                <Text style={styles.dappTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.dappDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.chainsRow}>
                  {item.chains.slice(0, 3).map((chain, i) => (
                    <View key={i} style={styles.chainTag}>
                      <Text style={styles.chainTagText}>{chain}</Text>
                    </View>
                  ))}
                  {item.chains.length > 3 && (
                    <Text style={styles.moreChains}>+{item.chains.length - 3}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050514' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginLeft: 10 },
  wcButton: {
    padding: 10, backgroundColor: 'rgba(59, 153, 252, 0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 153, 252, 0.3)',
  },
  sessionBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#3B99FC', justifyContent: 'center', alignItems: 'center',
  },
  sessionBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  pillsOuter: { marginTop: 16, marginBottom: 8 },
  pillsRow: { paddingHorizontal: 20, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  pillActive: { backgroundColor: 'rgba(59, 153, 252, 0.12)', borderColor: 'rgba(59, 153, 252, 0.4)' },
  pillText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#3B99FC' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  stateText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 12 },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: 'rgba(59, 153, 252, 0.15)', borderRadius: 8,
  },
  retryBtnText: { color: '#3B99FC', fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.03)',
  },
  iconContainer: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  dappIcon: { width: 36, height: 36, borderRadius: 10, resizeMode: 'contain' },
  dappDetails: { flex: 1, marginRight: 8 },
  dappTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  dappDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  chainsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  chainTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chainTagText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '500' },
  moreChains: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginLeft: 4 },
});
