import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import axios from 'axios';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const CATEGORIES = ['MEMECOINS', 'DEFI', 'Layer-1', 'Top Gainers'];
const TAB_MEME = ['DOGE', 'PEPE', 'WIF', 'BONK', 'SHIB', 'FLOKI'];
const TAB_REGULAR = ['BTC', 'ETH', 'APT', 'SOL', 'BNB', 'AVAX'];

interface OrderBookEntry {
  price: number;
  size: number;
}

export default function UnifiedTradingScreen() {
  const [activeCategory, setActiveCategory] = useState('MEMECOINS');
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // Order entry sub-screen (modal) states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(1);

  // Live order book state
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);

  // Fetch prices from our backend
  const fetchPrices = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/prices');
      setPrices(res.data);
      setLoading(false);
    } catch (err) {
      console.warn('Backend price fetch failed, using fallback', err);
      // Fallback prices in case server is off
      setPrices({
        'DOGE': { usd: 0.1542, usd_24h_change: 5.23 },
        'PEPE': { usd: 0.00000852, usd_24h_change: -2.14 },
        'WIF': { usd: 2.54, usd_24h_change: 12.45 },
        'BONK': { usd: 0.00002135, usd_24h_change: -1.32 },
        'SHIB': { usd: 0.00001785, usd_24h_change: 0.45 },
        'FLOKI': { usd: 0.0001625, usd_24h_change: 8.76 },
        'BTC': { usd: 64210.50, usd_24h_change: 1.25 },
        'ETH': { usd: 3485.20, usd_24h_change: -0.52 },
        'APT': { usd: 8.42, usd_24h_change: 2.41 },
        'SOL': { usd: 145.80, usd_24h_change: 4.12 },
        'BNB': { usd: 575.30, usd_24h_change: 0.85 },
        'AVAX': { usd: 28.15, usd_24h_change: -1.15 }
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Polling backend API every 6 seconds
    const pollInterval = setInterval(fetchPrices, 6000);

    // Live micro-ticks simulation on frontend every 1.5 seconds to feel responsive
    const tickInterval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (!next[key]) return;
          const factor = 1 + (Math.random() - 0.5) * 0.001;
          next[key] = {
            usd: next[key].usd * factor,
            usd_24h_change: next[key].usd_24h_change + (Math.random() - 0.5) * 0.02
          };
        });
        return next;
      });
    }, 1500);

    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, []);

  // Update order book when price changes
  useEffect(() => {
    const currentPrice = prices[activeSymbol]?.usd || 100;
    
    // Generate order book spread
    const newAsks: OrderBookEntry[] = [];
    const newBids: OrderBookEntry[] = [];
    for (let i = 1; i <= 5; i++) {
      const askPercent = 1 + (i * 0.0005);
      const bidPercent = 1 - (i * 0.0005);
      newAsks.push({
        price: currentPrice * askPercent,
        size: Math.random() * 2 + 0.1
      });
      newBids.push({
        price: currentPrice * bidPercent,
        size: Math.random() * 2 + 0.1
      });
    }
    // Asks sorted descending to show highest at the top
    setAsks(newAsks.reverse());
    setBids(newBids);
  }, [prices, activeSymbol]);

  const activePriceData = prices[activeSymbol] || { usd: 0, usd_24h_change: 0 };
  const formattedPrice = activePriceData.usd < 0.01 
    ? activePriceData.usd.toFixed(8) 
    : activePriceData.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const renderCoinRow = (symbol: string) => {
    const data = prices[symbol];
    if (!data) return null;
    const isGain = data.usd_24h_change >= 0;
    
    return (
      <TouchableOpacity 
        key={symbol} 
        style={[styles.coinRow, activeSymbol === symbol && styles.activeCoinRow]}
        onPress={() => setActiveSymbol(symbol)}
      >
        <View style={styles.coinDetails}>
          <Text style={styles.coinSymbol}>{symbol}/USDT</Text>
          <Text style={[styles.coinChange, { color: isGain ? CloudVoidTheme.colors.success : CloudVoidTheme.colors.danger }]}>
            {isGain ? '+' : ''}{data.usd_24h_change.toFixed(2)}%
          </Text>
        </View>
        <Text style={styles.coinPrice}>
          {data.usd < 0.01 ? data.usd.toFixed(6) : data.usd.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleConfirmOrder = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Order Placed',
      `Successfully placed ${orderType} order of ${amount} USDT worth of ${activeSymbol} with ${leverage}x leverage.`
    );
    setIsOrderModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unified Trading</Text>
        <Ionicons name="stats-chart-outline" size={24} color={CloudVoidTheme.colors.textSecondary} />
      </View>

      <View style={styles.topTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.topTab, activeCategory === cat && styles.activeTopTab]} 
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.topTabText, activeCategory === cat && styles.activeTopTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Left Sidebar: Asset List */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sidebarSectionTitle}>MEMECOINS</Text>
            {loading ? <ActivityIndicator color="#fff" /> : TAB_MEME.map(renderCoinRow)}
            
            <Text style={[styles.sidebarSectionTitle, { marginTop: 20 }]}>REGULAR COINS</Text>
            {loading ? null : TAB_REGULAR.map(renderCoinRow)}
          </ScrollView>
        </View>

        {/* Right Main Area */}
        <View style={styles.mainArea}>
          {/* Active Pair Price Info */}
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>{activeSymbol}/USDT</Text>
              <Text style={styles.activePriceText}>${formattedPrice}</Text>
            </View>
            <View style={styles.rightStats}>
              <Text style={[styles.changeText, { color: activePriceData.usd_24h_change >= 0 ? CloudVoidTheme.colors.success : CloudVoidTheme.colors.danger }]}>
                {activePriceData.usd_24h_change >= 0 ? '+' : ''}{activePriceData.usd_24h_change.toFixed(2)}%
              </Text>
              <Text style={styles.volumeLabel}>Vol: ${(activePriceData.usd * 458000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
            </View>
          </View>

          {/* SVG Candlestick Chart */}
          <View style={styles.chartBox}>
            <Svg width="100%" height="150" viewBox="0 0 200 100">
              {/* Grid Lines */}
              <Line x1="0" y1="25" x2="200" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <Line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <Line x1="0" y1="75" x2="200" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Candles */}
              <Rect x="20" y="45" width="8" height="20" fill={CloudVoidTheme.colors.success} />
              <Line x1="24" y1="35" x2="24" y2="75" stroke={CloudVoidTheme.colors.success} strokeWidth="1" />

              <Rect x="45" y="30" width="8" height="25" fill={CloudVoidTheme.colors.success} />
              <Line x1="49" y1="20" x2="49" y2="65" stroke={CloudVoidTheme.colors.success} strokeWidth="1" />

              <Rect x="70" y="45" width="8" height="15" fill={CloudVoidTheme.colors.danger} />
              <Line x1="74" y1="35" x2="74" y2="70" stroke={CloudVoidTheme.colors.danger} strokeWidth="1" />

              <Rect x="95" y="35" width="8" height="30" fill={CloudVoidTheme.colors.success} />
              <Line x1="99" y1="25" x2="99" y2="75" stroke={CloudVoidTheme.colors.success} strokeWidth="1" />

              <Rect x="120" y="50" width="8" height="25" fill={CloudVoidTheme.colors.danger} />
              <Line x1="124" y1="40" x2="124" y2="85" stroke={CloudVoidTheme.colors.danger} strokeWidth="1" />

              <Rect x="145" y="40" width="8" height="20" fill={CloudVoidTheme.colors.success} />
              <Line x1="149" y1="30" x2="149" y2="70" stroke={CloudVoidTheme.colors.success} strokeWidth="1" />

              <Rect x="170" y="25" width="8" height="25" fill={CloudVoidTheme.colors.success} />
              <Line x1="174" y1="15" x2="174" y2="60" stroke={CloudVoidTheme.colors.success} strokeWidth="1" />
            </Svg>
          </View>

          {/* Live Order Book */}
          <View style={styles.orderBookSection}>
            <Text style={styles.sectionHeader}>Live Order Book</Text>
            
            <View style={styles.orderBookGrid}>
              <View style={styles.orderBookColumn}>
                <Text style={styles.columnHeader}>Asks (Sell)</Text>
                {asks.map((ask, idx) => (
                  <View key={idx} style={styles.orderRow}>
                    <Text style={[styles.orderPrice, { color: CloudVoidTheme.colors.danger }]}>
                      {ask.price < 0.1 ? ask.price.toFixed(6) : ask.price.toFixed(2)}
                    </Text>
                    <Text style={styles.orderSize}>{ask.size.toFixed(3)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderBookColumn}>
                <Text style={styles.columnHeader}>Bids (Buy)</Text>
                {bids.map((bid, idx) => (
                  <View key={idx} style={styles.orderRow}>
                    <Text style={[styles.orderPrice, { color: CloudVoidTheme.colors.success }]}>
                      {bid.price < 0.1 ? bid.price.toFixed(6) : bid.price.toFixed(2)}
                    </Text>
                    <Text style={styles.orderSize}>{bid.size.toFixed(3)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Main Action Button to open Order Entry sub-screen */}
          <TouchableOpacity 
            style={styles.openOrderPanelBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsOrderModalOpen(true);
            }}
          >
            <Text style={styles.openOrderPanelBtnText}>Trade {activeSymbol}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Entry Sub-Screen (Slide-up Modal) */}
      <Modal
        visible={isOrderModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOrderModalOpen(false)}
      >
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={() => setIsOrderModalOpen(false)}
        >
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Place Order: {activeSymbol}/USDT</Text>

            {/* Buy/Sell Selector */}
            <View style={styles.orderTypeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, orderType === 'BUY' && styles.typeBtnBuyActive]}
                onPress={() => setOrderType('BUY')}
              >
                <Text style={[styles.typeBtnText, orderType === 'BUY' && styles.typeBtnTextActive]}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, orderType === 'SELL' && styles.typeBtnSellActive]}
                onPress={() => setOrderType('SELL')}
              >
                <Text style={[styles.typeBtnText, orderType === 'SELL' && styles.typeBtnTextActive]}>SELL</Text>
              </TouchableOpacity>
            </View>

            {/* Amount input */}
            <Text style={styles.inputLabel}>Order Amount (USDT)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Leverage Multiplier Selector */}
            <Text style={styles.inputLabel}>Leverage Multiplier ({leverage}x)</Text>
            <View style={styles.leverageContainer}>
              {[1, 5, 10, 20, 50].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.leveragePill, leverage === val && styles.activeLeveragePill]}
                  onPress={() => setLeverage(val)}
                >
                  <Text style={[styles.leveragePillText, leverage === val && styles.activeLeveragePillText]}>{val}x</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm Trade Action */}
            <TouchableOpacity 
              style={[
                styles.confirmTradeBtn,
                orderType === 'BUY' ? styles.confirmBuyBtn : styles.confirmSellBtn
              ]}
              onPress={handleConfirmOrder}
            >
              <Text style={styles.confirmTradeBtnText}>
                Confirm {orderType} {activeSymbol}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  topTabs: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  topTab: {
    marginRight: 20,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTopTab: {
    borderBottomColor: '#3B99FC',
  },
  topTabText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeTopTabText: {
    color: '#3B99FC',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  sidebarSectionTitle: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  coinRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  activeCoinRow: {
    backgroundColor: 'rgba(59, 153, 252, 0.08)',
  },
  coinDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coinSymbol: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  coinChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  coinPrice: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  mainArea: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 80,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  activePriceText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  rightStats: {
    alignItems: 'flex-end',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  volumeLabel: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  chartBox: {
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    marginVertical: 12,
  },
  orderBookSection: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  orderBookGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderBookColumn: {
    width: '48%',
  },
  columnHeader: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderSize: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
  },
  openOrderPanelBtn: {
    width: '100%',
    backgroundColor: '#3B99FC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  openOrderPanelBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0A0A1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  orderTypeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnBuyActive: {
    backgroundColor: CloudVoidTheme.colors.success,
  },
  typeBtnSellActive: {
    backgroundColor: CloudVoidTheme.colors.danger,
  },
  typeBtnText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  inputLabel: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  modalInput: {
    color: '#fff',
    height: 48,
    fontSize: 16,
  },
  leverageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  leveragePill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeLeveragePill: {
    borderColor: '#3B99FC',
    backgroundColor: 'rgba(59, 153, 252, 0.1)',
  },
  leveragePillText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeLeveragePillText: {
    color: '#3B99FC',
  },
  confirmTradeBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBuyBtn: {
    backgroundColor: CloudVoidTheme.colors.success,
  },
  confirmSellBtn: {
    backgroundColor: CloudVoidTheme.colors.danger,
  },
  confirmTradeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
