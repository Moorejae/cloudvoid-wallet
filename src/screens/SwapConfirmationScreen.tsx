import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { executeSwap, SwapQuote, SwapResult } from '../services/web3Api';
import { useWalletStore } from '../stores/walletStore';
import Svg, { Circle, Path } from 'react-native-svg';

export default function SwapConfirmationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { quote, walletAddress } = route.params as { quote: SwapQuote, walletAddress: string };

  const balances = useWalletStore((state) => state.balances);
  const setBalances = useWalletStore((state) => state.setBalances);
  const addTransaction = useWalletStore((state) => state.addTransaction);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SwapResult | null>(null);

  useEffect(() => {
    const doSwap = async () => {
      const res = await executeSwap(
        quote.fromToken,
        quote.toToken,
        quote.inputAmount,
        walletAddress,
        quote.estimatedOutput
      );
      if (res && res.status === 'confirmed') {
        // Reflect the executed swap in the local wallet state.
        const from = quote.fromToken;
        const to = quote.toToken;
        setBalances({
          [from]: (balances[from] || 0) - quote.inputAmount,
          [to]: (balances[to] || 0) + res.outputAmount,
        });
        addTransaction({
          id: res.transactionHash,
          type: 'Swap',
          token: `${from}➔${to}`,
          amount: quote.inputAmount,
          fiatAmount: quote.inputAmount * (quote.exchangeRate || 1),
          status: 'Confirmed',
          counterparty: '1inch Liquidity Router',
          timestamp: 'Just now',
        });
      }
      setResult(res);
      setLoading(false);
    };
    doSwap();
  }, [quote, walletAddress]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3B99FC" />
        <Text style={styles.loadingText}>Executing Swap...</Text>
        <Text style={styles.loadingSub}>Confirming transaction on-chain</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="close-circle" size={64} color="#FF4242" />
        <Text style={styles.errorTitle}>Swap Failed</Text>
        <Text style={styles.errorSub}>The transaction could not be executed.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Return</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIconWrap}>
          <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke="#00D395" strokeWidth="2" />
            <Path d="M8 12L11 15L16 9" stroke="#00D395" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        <Text style={styles.successTitle}>Swap Successful</Text>
        <Text style={styles.successAmount}>
          +{result.outputAmount.toFixed(4)} {result.toToken}
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paid</Text>
            <Text style={styles.detailValue}>{result.inputAmount} {result.fromToken}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gas Fee</Text>
            <Text style={styles.detailValue}>{result.gasFee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: '#00D395' }]}>Confirmed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Hash</Text>
            <Text style={styles.txHashText}>{result.transactionHash.substring(0, 16)}...</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Block Number</Text>
            <Text style={styles.detailValue}>{result.blockNumber}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050514' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24 },
  loadingSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 },
  errorTitle: { color: '#FF4242', fontSize: 24, fontWeight: '700', marginTop: 24 },
  errorSub: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 8 },
  
  content: { flex: 1, alignItems: 'center', paddingTop: 100, paddingHorizontal: 20 },
  successIconWrap: { marginBottom: 24 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  successAmount: { color: '#00D395', fontSize: 36, fontWeight: '700', marginBottom: 40 },
  
  detailsCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 12 },
  txHashText: { color: '#3B99FC', fontSize: 14, fontWeight: '600' },
  
  footer: { padding: 20, paddingBottom: 40 },
  doneBtn: { backgroundColor: '#3B99FC', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
