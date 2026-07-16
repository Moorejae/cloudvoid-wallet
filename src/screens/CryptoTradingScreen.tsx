import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { fetchWalletBalance, fetchTrendingTokens, fetchNewListings, getSwapQuote, TrendingToken, NewListing, SwapQuote } from '../services/web3Api';
import { useWalletStore } from '../stores/walletStore';

export default function CryptoTradingScreen() {
  const [balance, setBalance] = useState<{ totalValueUSD: number; balances: Record<string, number> } | null>(null);
  const [trending, setTrending] = useState<TrendingToken[]>([]);
  const [newListings, setNewListings] = useState<NewListing[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [fromToken, setFromToken] = useState('USDT');
  const [toToken, setToToken] = useState('DOGE');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoting, setQuoting] = useState(false);

  const navigation = useNavigation<any>();
  const userTokens = useWalletStore(state => state.tokens);
  const userId = useWalletStore(state => state.userId);

  useEffect(() => {
    const loadAllData = async () => {
      setLoadingData(true);
      const [bal, trend, news] = await Promise.all([
        fetchWalletBalance(userId),
        fetchTrendingTokens(),
        fetchNewListings()
      ]);
      if (bal) setBalance(bal);
      if (trend) setTrending(trend);
      if (news) setNewListings(news);
      setLoadingData(false);
    };
    loadAllData();
  }, []);

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setQuoting(true);
    const result = await getSwapQuote(fromToken, toToken, parseFloat(amount), '0xMockWalletAddress');
    setQuote(result);
    setQuoting(false);
  };

  const handleExecuteSwap = () => {
    if (!quote) return;
    navigation.navigate('SwapConfirmation', { quote, walletAddress: '0xMockWalletAddress' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8, padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Trading</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Banner */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Wallet Value</Text>
          <Text style={styles.balanceAmount}>
            ${balance ? balance.totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
          </Text>
          <View style={styles.balanceTag}>
            <Ionicons name="shield-checkmark" size={14} color="#3B99FC" style={{ marginRight: 4 }} />
            <Text style={styles.balanceTagText}>Self-Custody</Text>
          </View>
        </View>

        {/* Swap Interface */}
        <View style={styles.swapCard}>
          <View style={styles.swapHeader}>
            <Text style={styles.swapTitle}>Instant Swap</Text>
            <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.4)" />
          </View>

          {/* From Input */}
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>You Pay</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <TouchableOpacity style={styles.tokenSelector}>
                <Image 
                  source={{ uri: userTokens.find(t => t.symbol === fromToken)?.iconUrl || 'https://cryptologos.cc/logos/tether-usdt-logo.png' }} 
                  style={styles.tokenIconSm} 
                />
                <Text style={styles.tokenSymbol}>{fromToken}</Text>
                <Ionicons name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceSubText}>
              Balance: {balance?.balances[fromToken] || 0} {fromToken}
            </Text>
          </View>

          {/* Swap Arrow */}
          <View style={styles.swapArrowWrap}>
            <TouchableOpacity style={styles.swapArrowBtn} onPress={() => {
              setFromToken(toToken);
              setToToken(fromToken);
              setQuote(null);
            }}>
              <Ionicons name="arrow-down" size={18} color="#3B99FC" />
            </TouchableOpacity>
          </View>

          {/* To Input */}
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>You Receive</Text>
            <View style={styles.inputRow}>
              <Text style={styles.estimatedOutputText}>
                {quote ? quote.estimatedOutput : '---'}
              </Text>
              <TouchableOpacity style={styles.tokenSelector}>
                <Image 
                  source={{ uri: trending.find(t => t.symbol === toToken)?.icon || 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' }} 
                  style={styles.tokenIconSm} 
                />
                <Text style={styles.tokenSymbol}>{toToken}</Text>
                <Ionicons name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quote Details */}
          {quote && (
            <View style={styles.quoteDetails}>
              <View style={styles.quoteRow}><Text style={styles.quoteLabel}>Rate</Text><Text style={styles.quoteVal}>1 {fromToken} = {quote.exchangeRate} {toToken}</Text></View>
              <View style={styles.quoteRow}><Text style={styles.quoteLabel}>Slippage</Text><Text style={styles.quoteVal}>{quote.slippage}</Text></View>
              <View style={styles.quoteRow}><Text style={styles.quoteLabel}>Network Fee</Text><Text style={styles.quoteVal}>{quote.gasFee}</Text></View>
            </View>
          )}

          {/* Action Button */}
          {!quote ? (
            <TouchableOpacity style={styles.actionBtn} onPress={handleGetQuote} disabled={quoting || !amount}>
              {quoting ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Get Quote</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B99FC' }]} onPress={handleExecuteSwap}>
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Execute Swap</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trending Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Memecoins</Text>
        </View>
        
        {loadingData ? (
          <ActivityIndicator color="#3B99FC" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {trending.map((token, idx) => (
              <TouchableOpacity key={idx} style={styles.tokenCard} onPress={() => { setToToken(token.symbol); setQuote(null); }}>
                <Image source={{ uri: token.icon }} style={styles.tokenIconLg} />
                <Text style={styles.tokenCardSymbol}>{token.symbol}</Text>
                <Text style={styles.tokenCardPrice}>${token.price.toFixed(5)}</Text>
                <Text style={[styles.tokenCardChange, { color: token.change24h >= 0 ? '#00D395' : '#FF4242' }]}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* New Listings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Listings</Text>
        </View>
        
        {loadingData ? (
          <ActivityIndicator color="#3B99FC" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.verticalList}>
            {newListings.map((token, idx) => (
              <TouchableOpacity key={idx} style={styles.listRow} onPress={() => { setToToken(token.symbol); setQuote(null); }}>
                <Image source={{ uri: token.icon }} style={styles.tokenIconMd} />
                <View style={styles.listRowInfo}>
                  <Text style={styles.listRowName}>{token.name}</Text>
                  <Text style={styles.listRowSymbol}>{token.symbol}</Text>
                </View>
                <View style={styles.listRowPriceBox}>
                  <Text style={styles.listRowPrice}>${token.price.toFixed(4)}</Text>
                  <Text style={[styles.listRowChange, { color: token.change24h >= 0 ? '#00D395' : '#FF4242' }]}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050514' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  content: { padding: 20 },
  
  balanceCard: { backgroundColor: 'rgba(59, 153, 252, 0.1)', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(59, 153, 252, 0.2)' },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 12 },
  balanceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 153, 252, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  balanceTagText: { color: '#3B99FC', fontSize: 12, fontWeight: '600' },

  swapCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  swapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  swapTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  inputBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 16 },
  inputLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountInput: { color: '#fff', fontSize: 28, fontWeight: '600', flex: 1 },
  estimatedOutputText: { color: '#fff', fontSize: 28, fontWeight: '600', flex: 1 },
  tokenSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  tokenIconSm: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  tokenSymbol: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 6 },
  balanceSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 },
  
  swapArrowWrap: { alignItems: 'center', marginVertical: -12, zIndex: 10 },
  swapArrowBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#050514', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  quoteDetails: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  quoteLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  quoteVal: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  
  actionBtn: { backgroundColor: 'rgba(59, 153, 252, 0.1)', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  actionBtnText: { color: '#3B99FC', fontSize: 16, fontWeight: '700' },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  horizontalList: { gap: 12, paddingRight: 20, marginBottom: 30 },
  tokenCard: { width: 140, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  tokenIconLg: { width: 48, height: 48, borderRadius: 24, marginBottom: 12 },
  tokenCardSymbol: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  tokenCardPrice: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 },
  tokenCardChange: { fontSize: 14, fontWeight: '600' },

  verticalList: { gap: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16 },
  tokenIconMd: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  listRowInfo: { flex: 1 },
  listRowName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  listRowSymbol: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  listRowPriceBox: { alignItems: 'flex-end' },
  listRowPrice: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  listRowChange: { fontSize: 13, fontWeight: '600' },
});
