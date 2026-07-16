import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { useWalletConnectStore } from '../stores/walletConnectStore';

export default function Web3PortalScreen() {
  const navigation = useNavigation<any>();
  const sessions = useWalletConnectStore(state => state.sessions);

  const CARDS = [
    {
      id: 'defi',
      title: 'DeFi & DApps',
      description: 'Explore decentralized exchanges, lending, and yield.',
      icon: 'planet-outline',
      color: '#8B5CF6',
      route: 'DApps'
    },
    {
      id: 'memecoins',
      title: 'Memecoin Trading',
      description: 'Swap and trade high-volatility meme assets.',
      icon: 'flame-outline',
      color: '#F59E0B',
      route: 'CryptoTrading'
    },
    {
      id: 'rwa',
      title: 'Tokenized Stocks & RWAs',
      description: 'Trade real-world assets on the blockchain.',
      icon: 'business-outline',
      color: '#10B981',
      route: 'UnifiedTrading'
    },
    {
      id: 'wc',
      title: 'WalletConnect',
      description: `Manage Desktop connections (${sessions.length} active).`,
      icon: 'scan-circle-outline',
      color: '#3B99FC',
      route: 'WalletConnectScanner'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Web3 Portal</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.subtitle}>Welcome to the decentralized web. Select an ecosystem to enter.</Text>
        
        <View style={styles.grid}>
          {CARDS.map((card) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.card}
              onPress={() => navigation.navigate(card.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                <Ionicons name={card.icon as any} size={32} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
