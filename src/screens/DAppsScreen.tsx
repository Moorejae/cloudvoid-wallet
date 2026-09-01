import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { ALL_DAPPS } from './ExploreDAppsScreen';

const CATEGORIES = ['DEX', 'Lending', 'Yield', 'Staking', 'Predictions', 'NFTs', 'Games', 'AI & Bots', 'Bridge'];

export default function DAppsScreen() {
  const [activeCategory, setActiveCategory] = useState('DEX');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();

  const filteredDapps = useMemo(() => {
    return ALL_DAPPS.filter((dapp) => {
      const categoryMatch = dapp.category === activeCategory;
      const queryMatch = !searchQuery || dapp.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8, padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>dApps</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={CloudVoidTheme.colors.textDisabled} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dApps"
          placeholderTextColor={CloudVoidTheme.colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.pillsOuter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.pill, activeCategory === category && styles.pillActive]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[styles.pillText, activeCategory === category && styles.pillTextActive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDapps}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No dApps found in this category.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('DAppDetail', { appId: item.name })}
          >
            <View style={styles.iconContainer}>
              <Image source={{ uri: item.icon }} style={styles.dappIcon} />
            </View>
            <View style={styles.dappDetails}>
              <Text style={styles.dappTitle}>{item.name}</Text>
              <Text style={styles.dappDesc} numberOfLines={2}>{item.desc}</Text>
              <View style={styles.chainsRow}>
                <Text style={styles.chainTagText}>{item.category}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={CloudVoidTheme.colors.textDisabled} />
          </TouchableOpacity>
        )}
      />
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
  chainTagText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '500' },
  emptyText: { color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 32, fontSize: 14 },
});
