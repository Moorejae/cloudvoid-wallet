import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore } from '../stores/walletStore';

const TOKEN_ICONS: Record<string, string> = {
  BTC: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png',
  USDT: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  ETH: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  BNB: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
};

// Removed hardcoded mockData. We now dynamically format storeTransactions from walletStore.

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [showFilter, setShowFilter] = useState(false);
  
  // Bind directly to global store
  const activeTxFilter = useWalletStore((state) => state.activeTxFilter);
  const activeTxDateFilter = useWalletStore((state) => state.activeTxDateFilter);
  const activeTxHashQuery = useWalletStore((state) => state.activeTxHashQuery);
  
  const setSelectedStatus = useWalletStore((state) => state.setActiveTxFilter);
  const setActiveTxDateFilter = useWalletStore((state) => state.setActiveTxDateFilter);
  const setActiveTxHashQuery = useWalletStore((state) => state.setActiveTxHashQuery);

  const selectedStatus = activeTxFilter;
  const theme = useWalletStore((state) => state.theme);

  const headerCardColors: [string, string, string] = theme === 'light'
    ? ['#ffffff', '#f3f4f6', '#e5e7eb']
    : ['rgba(30, 30, 40, 1)', 'rgba(40, 30, 60, 1)', 'rgba(60, 40, 100, 1)'];

  const filterOptions: Array<{ id: 'All' | 'Receive' | 'Send' | 'Market'; label: string; icon: any; color: string }> = [
    { id: 'All', label: 'All Transactions', icon: 'list', color: '#a78bfa' },
    { id: 'Receive', label: 'Deposits / Receive', icon: 'arrow-down', color: '#22c55e' },
    { id: 'Send', label: 'Withdraws / Send', icon: 'arrow-up', color: '#ef4444' },
    { id: 'Market', label: 'Market Prices', icon: 'bar-chart', color: '#f59e0b' },
  ];

  const storeTransactions = useWalletStore((state) => state.transactions);

  const mockData = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    if (!storeTransactions || storeTransactions.length === 0) {
      return [];
    }
    
    storeTransactions.forEach(tx => {
      const dateStr = tx.dateGroup || 'Today';
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push({
        id: tx.id,
        token: tx.token,
        title: `${tx.type} ${tx.token}`,
        time: tx.timestamp || 'Just now',
        amount: `${tx.type === 'Receive' ? '+' : '-'}${tx.amount} ${tx.token}`,
        amountColor: tx.type === 'Receive' ? '#22c55e' : '#ef4444',
        hash: tx.id.slice(0,10) + '...',
        style: 'vertical'
      });
    });

    const result: any[] = [];
    let counter = 0;
    Object.keys(grouped).forEach((date, i) => {
      result.push({ type: 'header', title: date, id: `h${i}` });
      const items = grouped[date];
      for (let j = 0; j < items.length; j += 2) {
        result.push({
          type: 'row',
          id: `r${counter++}`,
          items: items.slice(j, j + 2)
        });
      }
    });

    return result;
  }, [storeTransactions]);

  // Filtering Logic
  const filteredData = mockData.map(group => {
    if (group.type === 'header') {
      if (activeTxDateFilter) {
        const query = activeTxDateFilter.toLowerCase();
        const headerTitle = group.title.toLowerCase();
        if (!headerTitle.includes(query) && !query.includes(headerTitle)) {
          return null;
        }
      }
      return group;
    }
    
    const filteredItems = group.items?.filter((item: any) => {
      // 1. Filter by Status/Type
      if (selectedStatus === 'Receive') {
        if (!item.title.toLowerCase().includes('deposit') && !item.title.toLowerCase().includes('receive')) return false;
      }
      if (selectedStatus === 'Send') {
        if (!item.title.toLowerCase().includes('sell') && !item.title.toLowerCase().includes('send') && !item.title.toLowerCase().includes('withdraw')) return false;
      }
      if (selectedStatus === 'Market') {
        if (item.title.toLowerCase().includes('deposit') || item.title.toLowerCase().includes('sell') || item.title.toLowerCase().includes('receive') || item.title.toLowerCase().includes('send')) return false;
      }

      // 2. Filter by Transaction Hash / Token / Title
      if (activeTxHashQuery) {
        const query = activeTxHashQuery.toLowerCase();
        const hash = (item.hash || '').toLowerCase();
        const token = (item.token || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        if (!hash.includes(query) && !token.includes(query) && !title.includes(query)) return false;
      }

      return true;
    });

    return {
      ...group,
      items: filteredItems
    };
  }).filter(group => group !== null && (group.type === 'header' || (group.items && group.items.length > 0)));

  // Remove orphan headers
  const finalData = [];
  for (let i = 0; i < filteredData.length; i++) {
    if (filteredData[i].type === 'header') {
      if (i + 1 < filteredData.length && filteredData[i + 1].type === 'row') {
        finalData.push(filteredData[i]);
      }
    } else {
      // Re-group rows to ensure max 2 items per row, or just let it render with 1 item which it handles correctly
      finalData.push(filteredData[i]);
    }
  }

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    return (
      <View style={styles.rowContainer}>
        {item.items.map((card: any) => {
          if (card.style === 'vertical') {
            return (
              <TouchableOpacity 
                style={styles.txCard} 
                key={card.id}
                onPress={() => navigation.navigate('TransactionReceipt', {
                  tx: {
                    id: card.id,
                    type: card.amount.includes('+') ? 'Receive' : 'Send',
                    token: card.token,
                    amount: parseFloat(card.amount.replace(/[^0-9.-]+/g,"")),
                    timestamp: card.time,
                    counterparty: card.hash,
                    status: 'Confirmed'
                  }
                })}
              >
                <Image source={{ uri: TOKEN_ICONS[card.token] }} style={styles.tokenLogo} />
                <Text style={styles.txTitle}>{card.title}</Text>
                <Text style={styles.txTime}>{card.time}</Text>
                <View style={styles.spacer} />
                <Text style={[styles.txAmount, { color: card.amountColor }]}>{card.amount}</Text>
                <Text style={styles.txHash} numberOfLines={1} ellipsizeMode="tail">
                  {card.hash}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <View style={styles.marketCard} key={card.id}>
                <View style={styles.marketTop}>
                  <Image source={{ uri: TOKEN_ICONS[card.token] }} style={styles.tokenLogoSmall} />
                  <Text style={styles.marketTitle}>{card.title}</Text>
                </View>
                <View style={styles.marketBottom}>
                  <Text style={styles.marketPrice}>{card.price}</Text>
                  {card.delta && (
                    <Text style={[styles.marketDelta, { color: card.deltaColor }]}> {card.delta}</Text>
                  )}
                </View>
              </View>
            );
          }
        })}
        {item.items.length === 1 && <View style={[styles.marketCard, { opacity: 0 }]} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Exact Header Bar matches image */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={headerCardColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Transaction History</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="options-outline" size={20} color={CloudVoidTheme.colors.accent} />
            {(selectedStatus !== 'All' || activeTxDateFilter || activeTxHashQuery) && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {(activeTxDateFilter || activeTxHashQuery) && (
        <View style={styles.activeFiltersBanner}>
          <Text style={styles.activeFiltersText} numberOfLines={1}>
            🔍 {activeTxDateFilter ? `Date: ${activeTxDateFilter}` : ''}
            {activeTxDateFilter && activeTxHashQuery ? ' | ' : ''}
            {activeTxHashQuery ? `Query: "${activeTxHashQuery}"` : ''}
          </Text>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => {
            setActiveTxDateFilter(null);
            setActiveTxHashQuery(null);
          }}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {finalData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#4b5563" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No transactions found for</Text>
          <Text style={styles.emptyTextBold}>{selectedStatus}</Text>
        </View>
      ) : (
        <FlatList
          data={finalData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal Overlay */}
      <Modal
        visible={showFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={styles.filterCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.filterTitle}>Filter by Type</Text>
            
            <View style={styles.filterOptionsContainer}>
              {filterOptions.map((option) => (
                <TouchableOpacity 
                  key={option.id} 
                  style={styles.filterOptionRow}
                  onPress={() => setSelectedStatus(option.id as 'All' | 'Receive' | 'Send' | 'Market')}
                >
                  <View style={styles.radioCircle}>
                    {selectedStatus === option.id && <View style={styles.radioInner} />}
                  </View>
                  {option.icon && (
                    <Ionicons name={option.icon as any} size={20} color={option.color} style={{marginHorizontal: 8}} />
                  )}
                  <Text style={[styles.filterOptionText, !option.icon && {marginLeft: 8}]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedStatus('All')}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 60,
  },
  headerContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: CloudVoidTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#1e1e2d',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  txCard: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  marketCard: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    justifyContent: 'center',
  },
  tokenLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  tokenLogoSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 2,
  },
  txTime: {
    fontSize: 11,
    color: CloudVoidTheme.colors.textSecondary,
  },
  spacer: {
    height: 24,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  txHash: {
    fontSize: 10,
    color: CloudVoidTheme.colors.textSecondary,
  },
  marketTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  marketTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
  },
  marketBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketPrice: {
    fontSize: 11,
    color: CloudVoidTheme.colors.textSecondary,
  },
  marketDelta: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  emptyTextBold: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCard: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    width: '85%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  filterTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  filterOptionsContainer: {
    marginBottom: 24,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  filterOptionText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFiltersBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  activeFiltersText: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  clearFiltersBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '700',
  },
});
