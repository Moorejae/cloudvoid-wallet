import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, Image, Platform, Modal, TextInput, ActivityIndicator, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import AddWalletModal from '../components/AddWalletModal';
import { Ionicons } from '@expo/vector-icons';
import { TRANSLATIONS } from '../utils/translations';
import { getFiatBuyQuote, executeFiatBuy } from '../services/web3Api';
import { chainById } from '../services/chains';
import { fetchCoinGeckoPrices, fetchCoinGeckoToken } from '../services/coinGecko';

interface TokenItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  iconUrl: string;
  sparklineData: number[];
}

const DEFAULT_TOKENS: TokenItem[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64210.50, change: 1.25, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png', sparklineData: [40, 45, 42, 50, 48, 55, 60] },
  { symbol: 'ETH', name: 'Ethereum', price: 3485.20, change: -0.52, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [60, 55, 58, 45, 48, 40, 35] },
  { symbol: 'BNB', name: 'BNB', price: 575.30, change: 0.85, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', sparklineData: [45, 48, 42, 40, 38, 42, 38] },
  { symbol: 'XMR', name: 'Monero', price: 167.00, change: 3.45, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monero/info/logo.png', sparklineData: [20, 25, 30, 40, 50, 55, 60] },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.02, iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', sparklineData: [50, 52, 48, 49, 45, 42, 40] },
];

export default function DashboardScreen({ navigation }: any) {
  const storeTokens = useWalletStore((state) => state.tokens);
  const [tokens, setTokens] = useState<TokenItem[]>(storeTokens);
  const [hideBalance, setHideBalance] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenPrice, setNewTokenPrice] = useState('1');
  const [refreshing, setRefreshing] = useState(false);
  
  const balances = useWalletStore((state) => state.balances);
  const userId = useWalletStore((state) => state.userId);
  const selectedCurrency = useWalletStore((state) => state.selectedCurrency);
  const selectedLanguage = useWalletStore((state) => state.selectedLanguage);
  const wallets = useWalletStore((state) => state.wallets);
  const activeWalletId = useWalletStore((state) => state.activeWalletId) || '1';
  const activeWallet = wallets.find(w => w.id === activeWalletId) || wallets[0];



  useEffect(() => {
    setTokens(storeTokens);
  }, [storeTokens]);

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
  };

  const CURRENCY_RATES: Record<string, number> = {
    USD: 1,
    NGN: 1550,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 155,
    CAD: 1.36,
    AUD: 1.51,
  };

  const t = (Platform.OS === 'web' && selectedLanguage !== 'English')
    ? TRANSLATIONS.English 
    : (TRANSLATIONS[selectedLanguage] || TRANSLATIONS.English);
  const symbol = CURRENCY_SYMBOLS[selectedCurrency] || '$';
  const rate = CURRENCY_RATES[selectedCurrency] || 1;

  // Fetch real balances from the backend via the riverbed envelope (Phase 1)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const loadRealData = async () => {
      try {
        const livePrices = await fetchCoinGeckoPrices();
        if (livePrices.length > 0) {
          const mappedTokens = livePrices.map((token) => ({
            symbol: token.symbol,
            name: token.name,
            price: token.price,
            change: token.change,
            iconUrl: token.iconUrl,
            sparklineData: token.sparklineData,
          }));
          // Merge with existing custom tokens that CoinGecko cannot resolve.
          const existing = useWalletStore.getState().tokens;
          const merged = existing.map((t) => mappedTokens.find((m) => m.symbol === t.symbol) || t);
          const added = mappedTokens.filter((m) => !existing.some((t) => t.symbol === m.symbol));
          const next = [...merged, ...added];
          setTokens(next);
          useWalletStore.getState().setTokens(next);
        }

        const { fetchWalletBalances } = require('../services/wallet/balances');
        const balances = await fetchWalletBalances();
        if (!balances) return;

        const newBalances: Record<string, number> = {};
        for (const [chainId, b] of Object.entries(balances) as [string, any][]) {
          if (b && b.status === 'no_address') continue;
          const meta = chainById(chainId);
          if (!meta || !b) continue;
          newBalances[meta.symbol] = Number(b.balance || 0);
        }
        useWalletStore.getState().setBalances(newBalances);
      } catch (err) {
        console.warn('Error fetching real balances:', err);
      }
    };

    if (userId) {
      loadRealData();
      interval = setInterval(loadRealData, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const livePrices = await fetchCoinGeckoPrices();
      if (livePrices.length > 0) {
        const mapped = livePrices.map((token) => ({
          symbol: token.symbol,
          name: token.name,
          price: token.price,
          change: token.change,
          iconUrl: token.iconUrl,
          sparklineData: token.sparklineData,
        }));
        // Merge: keep custom tokens that CoinGecko could not resolve.
        const merged = tokens.map((t) => mapped.find((m) => m.symbol === t.symbol) || t);
        const added = mapped.filter((m) => !tokens.some((t) => t.symbol === m.symbol));
        const next = [...merged, ...added];
        setTokens(next);
        useWalletStore.getState().setTokens(next);
      }
    } catch (err) {
      console.warn('CoinGecko refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddCustomToken = async () => {
    const symbol = newTokenSymbol.trim().toUpperCase();
    const name = newTokenName.trim() || symbol || 'Custom Token';
    const parsedPrice = Number(newTokenPrice);

    if (!symbol) {
      Alert.alert('Token symbol required', 'Enter a token symbol before saving.');
      return;
    }

    // Try to resolve the REAL token + live price first.
    let tokenEntry: TokenItem | null = null;
    try {
      const live = await fetchCoinGeckoToken(symbol);
      if (live && live.price > 0) {
        tokenEntry = {
          symbol: live.symbol,
          name: name !== symbol ? name : live.name,
          price: live.price,
          change: live.change,
          iconUrl: live.iconUrl || 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
          sparklineData: live.sparklineData.length ? live.sparklineData : [50, 51, 50, 52, 51, 53, 52],
        };
      }
    } catch {
      // fall through to manual entry
    }

    if (!tokenEntry) {
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        Alert.alert(
          'Token not found + invalid price',
          `Could not find a live price for ${symbol}. Enter a valid positive price to add it manually.`
        );
        return;
      }
      tokenEntry = {
        symbol,
        name,
        price: parsedPrice,
        change: 0,
        iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
        sparklineData: [50, 51, 50, 52, 51, 53, 52],
      };
    }

    const exists = tokens.some((item) => item.symbol.toUpperCase() === symbol);
    const nextTokens = exists
      ? tokens.map((item) => (item.symbol.toUpperCase() === symbol ? tokenEntry! : item))
      : [...tokens, tokenEntry];

    setTokens(nextTokens);
    useWalletStore.getState().setTokens(nextTokens);
    setNewTokenSymbol('');
    setNewTokenName('');
    setNewTokenPrice('1');
    setIsAddTokenOpen(false);
    Alert.alert(
      'Token added',
      `${tokenEntry.name} (${tokenEntry.symbol}) is now in your wallet at $${tokenEntry.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}.`
    );
  };

  const storeTotal = tokens.reduce((sum, token) => sum + (balances[token.symbol] || 0) * token.price, 0);
  
  const displayValue = storeTotal * rate;
  
  const displayBalance = hideBalance 
    ? '••••••' 
    : `${symbol}${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderSparkline = (data: number[], isGain: boolean) => {
    const width = 60;
    const height = 24;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const strokeColor = isGain ? CloudVoidTheme.colors.success : CloudVoidTheme.colors.danger;

    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgLinearGradient id={`grad-${isGain ? 'gain' : 'loss'}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        <Path d={`${points} L ${width} ${height} L 0 ${height} Z`} fill={`url(#grad-${isGain ? 'gain' : 'loss'})`} />
        <Path d={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header Icons */}
      <View style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setIsAddWalletOpen(true)} style={styles.headerIconBtn}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M19 7H5C3.89543 7 3 7.89543 3 9V17C3 18.1046 3.89543 19 5 19H14" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M19 11V15" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M21 11H17C15.8954 11 15 11.8954 15 13C15 14.1046 15.8954 15 17 15H21V11Z" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Plus badge */}
              <Path d="M18 16V20M16 18H20" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Web3')}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* Central globe outline */}
              <Circle cx="12" cy="12" r="5" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5"/>
              <Path d="M12 7C14.2091 7 16 9.23858 16 12C16 14.7614 14.2091 17 12 17C9.79086 17 8 14.7614 8 12C8 9.23858 9.79086 7 12 7Z" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
              <Path d="M7 12H17" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
              {/* Dotted network circle */}
              <Circle cx="12" cy="12" r="9" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1" strokeDasharray="2 4" />
              {/* Nodes */}
              <Circle cx="12" cy="3" r="2" fill={CloudVoidTheme.colors.bgInternal} stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
              <Circle cx="3" cy="12" r="2" fill={CloudVoidTheme.colors.bgInternal} stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
              <Circle cx="21" cy="12" r="2" fill={CloudVoidTheme.colors.bgInternal} stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
              <Circle cx="12" cy="21" r="2" fill={CloudVoidTheme.colors.bgInternal} stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Card */}
        <TouchableOpacity style={styles.portfolioCard} onPress={() => setHideBalance(!hideBalance)} activeOpacity={0.8}>
          <View style={styles.activeWalletBadge}>
            <Ionicons name="wallet-outline" size={14} color="#a78bfa" />
            <Text style={styles.activeWalletBadgeText}>{activeWallet ? activeWallet.name : 'Main Wallet'}</Text>
          </View>
          <Text style={styles.portfolioLabel}>{t.portfolioBalance}</Text>
          <Text style={styles.portfolioBalance}>{displayBalance}</Text>
        </TouchableOpacity>



        {/* Token List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{t.totalAssets}</Text>
          <TouchableOpacity style={styles.addTokenBtn} onPress={() => setIsAddTokenOpen(true)}>
            <Ionicons name="add-circle-outline" size={18} color={CloudVoidTheme.colors.accent} />
            <Text style={styles.addTokenText}>Add token</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tokenList}>
          {tokens.map((token, index) => {
            const isGain = token.change >= 0;
            const isLast = index === tokens.length - 1;

            return (
              <React.Fragment key={token.symbol}>
                <TouchableOpacity 
                  style={styles.tokenCard}
                  onPress={() => navigation.navigate('TokenDetail', { token })}
                >
                  <View style={styles.tokenLeft}>
                    <Image source={{ uri: token.iconUrl }} style={styles.tokenLogo} />
                    <View>
                      <Text style={styles.tokenName}>{token.name}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.tokenPrice}>
                          {symbol}{(token.price * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={[styles.tokenPriceChange, { color: isGain ? CloudVoidTheme.colors.success : CloudVoidTheme.colors.danger }]}>
                          {isGain ? '+' : ''}{(token.change ?? 0).toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tokenRight}>
                    {renderSparkline(token.sparklineData, isGain)}
                  </View>
                </TouchableOpacity>
                {!isLast && <View style={styles.tokenDivider} />}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={isAddTokenOpen} transparent animationType="slide" onRequestClose={() => setIsAddTokenOpen(false)}>
        <Pressable style={styles.tokenModalOverlay} onPress={() => setIsAddTokenOpen(false)}>
          <Pressable style={styles.tokenModalCard}>
            <Text style={styles.tokenModalTitle}>Add custom token</Text>
            <TextInput
              style={styles.tokenInput}
              placeholder="Token symbol"
              value={newTokenSymbol}
              onChangeText={setNewTokenSymbol}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TextInput
              style={styles.tokenInput}
              placeholder="Token name"
              value={newTokenName}
              onChangeText={setNewTokenName}
            />
            <TextInput
              style={styles.tokenInput}
              placeholder="Price in USD"
              value={newTokenPrice}
              onChangeText={setNewTokenPrice}
              keyboardType="decimal-pad"
            />
            <View style={styles.tokenModalActions}>
              <TouchableOpacity style={styles.tokenModalCancel} onPress={() => setIsAddTokenOpen(false)}>
                <Text style={styles.tokenModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tokenModalSave} onPress={handleAddCustomToken}>
                <Text style={styles.tokenModalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <AddWalletModal
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onNavigateCreate={() => navigation.navigate('CreateWallet', { mode: 'add' })}
        onNavigateImport={() => navigation.navigate('ImportWallet', { mode: 'add' })}
        onTriggerToast={(msg) => Alert.alert('Wallet', msg)}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 60,
  },
  customHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    position: 'relative',
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)', // subtle violet border matching icons
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: CloudVoidTheme.colors.bgInternal,
    padding: 2,
  },
  portfolioCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  portfolioLabel: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 8,
  },
  portfolioBalance: {
    fontSize: 34,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  portfolioMovement: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '500',
  },
  movementPositive: {
    color: CloudVoidTheme.colors.success,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
  },
  addTokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  addTokenText: {
    color: CloudVoidTheme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tokenList: {
    backgroundColor: CloudVoidTheme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  tokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  tokenDivider: {
    height: 1,
    backgroundColor: CloudVoidTheme.colors.border,
    opacity: 0.5,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tokenLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tokenName: {
    fontSize: 15,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenPrice: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textSecondary,
  },
  tokenPriceChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  tokenRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 140, 
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tokenModalCard: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  tokenModalTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  tokenInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 12,
  },
  tokenModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  tokenModalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tokenModalCancelText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
  },
  tokenModalSave: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: CloudVoidTheme.colors.accent,
  },
  tokenModalSaveText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  buyModalContent: {
    backgroundColor: '#050514',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 450,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  selectorBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectorActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  selectorText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  selectorActiveText: {
    color: '#fff',
  },
  providerRow: {
    flexDirection: 'column',
    gap: 10,
  },
  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  providerActive: {
    backgroundColor: 'rgba(0, 211, 149, 0.1)',
    borderColor: '#00D395',
  },
  providerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    fontSize: 15,
  },
  providerActiveText: {
    color: '#fff',
  },
  actionBtnSubmit: {
    backgroundColor: '#3B99FC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  actionBtnTextSubmit: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  quoteContainer: {
    paddingVertical: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  quoteLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  quoteVal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalVal: {
    color: '#00D395',
    fontSize: 20,
    fontWeight: '700',
  },
  backBtnText: {
    alignItems: 'center',
    marginTop: 16,
  },
  backBtnTextContent: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  },
  loadingSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 8,
  },
  activeWalletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.25)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  activeWalletBadgeText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
});
