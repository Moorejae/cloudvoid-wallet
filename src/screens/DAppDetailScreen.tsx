import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchDAppDetail, DApp } from '../services/web3Api';
import { useWalletConnectStore } from '../stores/walletConnectStore';

export default function DAppDetailScreen() {
  const [dapp, setDapp] = useState<DApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { appId } = route.params;
  
  const pair = useWalletConnectStore(state => state.pair);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDAppDetail(appId);
      setDapp(data);
      setLoading(false);
    };
    loadData();
  }, [appId]);

  const handleConnect = async () => {
    if (!dapp) return;
    setConnecting(true);
    
    // Simulate WC pairing with this specific dApp
    try {
      await new Promise(res => setTimeout(res, 1500)); // Simulate delay
      const mockUri = `wc:${Math.random().toString(36).substring(7)}@2?relay-protocol=irn&symKey=${Math.random().toString(36).substring(7)}`;
      const success = await pair(mockUri);
      
      if (success) {
        Alert.alert('Connected', `Successfully connected to ${dapp.name}`);
        navigation.goBack();
      } else {
        Alert.alert('Connection Failed', 'Could not establish connection with ' + dapp.name);
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred during connection.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerState]}>
        <ActivityIndicator size="large" color="#3B99FC" />
      </View>
    );
  }

  if (!dapp) {
    return (
      <View style={[styles.container, styles.centerState]}>
        <Text style={styles.errorText}>dApp not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dapp.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.iconWrapper}>
            <Image source={{ uri: dapp.icon }} style={styles.heroIcon} />
          </View>
          <Text style={styles.title}>{dapp.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{dapp.category}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descText}>{dapp.description}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={18} color="rgba(255,255,255,0.4)" />
            <Text style={styles.infoText}>{dapp.url}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="link-outline" size={18} color="rgba(255,255,255,0.4)" />
            <Text style={styles.infoText}>{dapp.wcIdentifier}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Supported Chains</Text>
          <View style={styles.chainsWrap}>
            {dapp.chains.map((chain, idx) => (
              <View key={idx} style={styles.chainPill}>
                <Text style={styles.chainPillText}>{chain}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.connectBtn} 
          onPress={handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="link" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.connectBtnText}>Connect Wallet</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050514' },
  centerState: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 20 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  backIcon: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  
  content: { padding: 20, paddingBottom: 120 },
  heroSection: { alignItems: 'center', marginBottom: 30 },
  iconWrapper: { width: 90, height: 90, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroIcon: { width: 60, height: 60, borderRadius: 16, resizeMode: 'contain' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(59, 153, 252, 0.15)', borderRadius: 12 },
  categoryText: { color: '#3B99FC', fontSize: 12, fontWeight: '600' },
  
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  descText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginLeft: 8 },
  
  chainsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chainPill: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
  chainPillText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: 'rgba(5,5,20,0.9)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  connectBtn: { flexDirection: 'row', backgroundColor: '#3B99FC', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  connectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
