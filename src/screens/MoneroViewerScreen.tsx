import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { API_BASE_URL } from '../services/web3Api';

export default function MoneroViewerScreen({ navigation }: any) {
  const mnemonic = useWalletStore((state) => state.mnemonic);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<any>(null);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);

  useEffect(() => {
    async function deriveMoneroKeys() {
      if (!mnemonic) {
        Alert.alert('No Wallet Found', 'Please create or import a wallet first.');
        navigation.goBack();
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/api/derive-monero`, { mnemonic });
        setKeys(response.data);
      } catch (err: any) {
        console.error('XMR derivation error:', err.message);
        Alert.alert('Error', 'Could not derive Monero wallet keys.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    deriveMoneroKeys();
  }, [mnemonic]);

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Deriving Monero Keys...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monero Wallet</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>XMR Balance</Text>
          <Text style={styles.balanceAmount}>{keys?.balance?.toFixed(4) || '0.0000'} XMR</Text>
          <Text style={styles.balanceUSD}>$0.00 USD</Text>
        </View>

        {/* Keys Card */}
        <View style={styles.keysCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Wallet Keys & Secrets</Text>
            <TouchableOpacity onPress={() => setShowPrivateKeys(!showPrivateKeys)}>
              <Ionicons name={showPrivateKeys ? "eye-off-outline" : "eye-outline"} size={22} color="#8b5cf6" />
            </TouchableOpacity>
          </View>

          {/* Primary Address */}
          <View style={styles.keyRow}>
            <View style={styles.keyHeaderRow}>
              <Text style={styles.keyLabel}>Public Address</Text>
              <TouchableOpacity onPress={() => copyToClipboard(keys?.address, 'XMR Public Address')}>
                <Ionicons name="copy-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <Text style={styles.keyValue} numberOfLines={2}>{keys?.address}</Text>
          </View>

          <View style={styles.divider} />

          {/* Public Spend Key */}
          <View style={styles.keyRow}>
            <View style={styles.keyHeaderRow}>
              <Text style={styles.keyLabel}>Public Spend Key (spendPublicKey)</Text>
              <TouchableOpacity onPress={() => copyToClipboard(keys?.spendPublic, 'Public Spend Key')}>
                <Ionicons name="copy-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <Text style={styles.keyValue}>{keys?.spendPublic}</Text>
          </View>

          <View style={styles.divider} />

          {/* Public View Key */}
          <View style={styles.keyRow}>
            <View style={styles.keyHeaderRow}>
              <Text style={styles.keyLabel}>Public View Key (viewPublicKey)</Text>
              <TouchableOpacity onPress={() => copyToClipboard(keys?.viewPublic, 'Public View Key')}>
                <Ionicons name="copy-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <Text style={styles.keyValue}>{keys?.viewPublic}</Text>
          </View>

          <View style={styles.divider} />

          {/* Private Spend Key */}
          <View style={styles.keyRow}>
            <View style={styles.keyHeaderRow}>
              <Text style={styles.keyLabel}>Private Spend Key (spendSecretKey)</Text>
              <TouchableOpacity 
                disabled={!showPrivateKeys} 
                onPress={() => copyToClipboard(keys?.spendSecret, 'Private Spend Key')}
              >
                <Ionicons name="copy-outline" size={16} color={showPrivateKeys ? "#9ca3af" : "#4b5563"} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.keyValue, !showPrivateKeys && styles.hiddenKey]}>
              {showPrivateKeys ? keys?.spendSecret : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Private View Key */}
          <View style={styles.keyRow}>
            <View style={styles.keyHeaderRow}>
              <Text style={styles.keyLabel}>Private View Key (viewSecretKey)</Text>
              <TouchableOpacity 
                disabled={!showPrivateKeys} 
                onPress={() => copyToClipboard(keys?.viewSecret, 'Private View Key')}
              >
                <Ionicons name="copy-outline" size={16} color={showPrivateKeys ? "#9ca3af" : "#4b5563"} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.keyValue, !showPrivateKeys && styles.hiddenKey]}>
              {showPrivateKeys ? keys?.viewSecret : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.bg,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
  },
  balanceCard: {
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceUSD: {
    color: '#6b7280',
    fontSize: 16,
  },
  keysCard: {
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keyRow: {
    marginVertical: 8,
  },
  keyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  keyLabel: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '600',
  },
  keyValue: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 18,
  },
  hiddenKey: {
    color: '#4b5563',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
});
