import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import { CloudVoidTheme } from '../theme/tokens';

interface PingItem {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  iconColor: string;
  latency: number | null;
  isCustom?: boolean;
}

export default function LocalLatencyPingsScreen({ navigation }: any) {
  const customRPCs = useWalletStore((state) => state.customRPCs);

  const [loading, setLoading] = useState(false);
  const [pings, setPings] = useState<PingItem[]>([
    { id: '1', name: 'Bitcoin', symbol: 'BTC', icon: 'logo-bitcoin', iconColor: '#f59e0b', latency: 25 },
    { id: '2', name: 'Ethereum', symbol: 'ETH', icon: 'diamond-outline', iconColor: '#3b82f6', latency: 32 },
    { id: '3', name: 'Binance Smart Chain', symbol: 'BSC', icon: 'logo-buffer', iconColor: '#eab308', latency: 18 },
    { id: '4', name: 'Aptos USDT', symbol: 'APT', icon: 'water-outline', iconColor: '#14b8a6', latency: 48 },
    { id: '5', name: 'Solana', symbol: 'SOL', icon: 'infinite-outline', iconColor: '#a855f7', latency: 112 },
    { id: '6', name: 'Tron', symbol: 'TRX', icon: 'triangle-outline', iconColor: '#ef4444', latency: 65 },
    { id: '7', name: 'Polygon', symbol: 'MATIC', icon: 'hexagon-outline', iconColor: '#8b5cf6', latency: 38 },
  ]);

  // Sync custom RPCs from global walletStore
  useEffect(() => {
    const formattedCustom = customRPCs.map((rpc) => ({
      id: rpc.id,
      name: rpc.name,
      symbol: rpc.symbol,
      icon: 'server-outline',
      iconColor: '#10b981',
      latency: rpc.latency || null,
      isCustom: true,
    }));

    setPings((prev) => {
      const mainnets = prev.filter((p) => !p.isCustom);
      return [...mainnets, ...formattedCustom];
    });
  }, [customRPCs]);

  const runPings = () => {
    setLoading(true);
    setTimeout(() => {
      setPings((prev) =>
        prev.map((item) => ({
          ...item,
          latency: 0,
        }))
      );
      setLoading(false);
    }, 1500);
  };

  const getLatencyColor = (latency: number | null) => {
    if (latency === null) return '#6b7280';
    if (latency < 50) return '#10b981'; // Green
    if (latency < 100) return '#f59e0b'; // Yellow/Orange
    return '#ef4444'; // Red
  };

  const renderPingRow = ({ item }: { item: PingItem }) => {
    const color = getLatencyColor(item.latency);
    return (
      <View style={styles.row}>
        <View style={styles.leftContainer}>
          <View style={[styles.iconWrapper, { backgroundColor: item.iconColor + '15' }]}>
            <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
          </View>
          <View style={styles.nameWrapper}>
            <Text style={styles.chainName}>{item.name}</Text>
            <Text style={styles.chainSymbol}>{item.symbol} {item.isCustom && '(Custom)'}</Text>
          </View>
        </View>

        <View style={styles.rightContainer}>
          {item.latency !== null ? (
            <>
              <Text style={[styles.latencyText, { color }]}>{item.latency}ms</Text>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
            </>
          ) : (
            <Text style={styles.pendingText}>Pending</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Local Latency Pings (RPC)</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCustomRPC')}>
          <Ionicons name="add" size={26} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Measured via local WebSocket ping</Text>

      <FlatList
        data={pings}
        keyExtractor={(item) => item.id}
        renderItem={renderPingRow}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.runBtn} onPress={runPings} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={CloudVoidTheme.colors.textPrimary} />
          ) : (
            <Text style={styles.runBtnText}>Run All Pings</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: CloudVoidTheme.colors.bg,
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
    textAlign: 'center',
    flex: 1,
  },
  addBtn: {
    alignItems: 'flex-end',
    width: 80,
  },
  subtitle: {
    color: CloudVoidTheme.colors.textSubHeader,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  nameWrapper: {
    justifyContent: 'center',
  },
  chainName: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  chainSymbol: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  latencyText: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pendingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  runBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  runBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
