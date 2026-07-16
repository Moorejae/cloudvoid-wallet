import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import { CloudVoidTheme } from '../theme/tokens';

export default function AddCustomRPCScreen({ navigation }: any) {
  const addCustomRPC = useWalletStore((state) => state.addCustomRPC);

  const [networkName, setNetworkName] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const [chainId, setChainId] = useState('');
  const [symbol, setSymbol] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');

  const handleSave = () => {
    if (!networkName || !rpcUrl || !chainId || !symbol) {
      Alert.alert('Error', 'Please fill in all required fields (Explorer URL is optional).');
      return;
    }

    const newRPC = {
      id: Math.random().toString(36).substring(7),
      name: networkName,
      rpcUrl: rpcUrl,
      chainId: chainId,
      symbol: symbol,
      explorerUrl: explorerUrl || undefined,
      latency: 0,
    };

    addCustomRPC(newRPC);
    Alert.alert('Success', 'Custom RPC added successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Custom RPC</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Network Name →</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g., BSC Mainnet"
            placeholderTextColor="#6b7280"
            value={networkName}
            onChangeText={setNetworkName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>RPC URL →</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g., https://bsc-dataseed.binance.org/"
            placeholderTextColor="#6b7280"
            value={rpcUrl}
            onChangeText={setRpcUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Chain ID →</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g., e.g., 56"
            placeholderTextColor="#6b7280"
            value={chainId}
            onChangeText={setChainId}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Symbol →</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g., e.g., BNB"
            placeholderTextColor="#6b7280"
            value={symbol}
            onChangeText={setSymbol}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Explorer URL →</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g., e.g., https://bscscan.com/"
            placeholderTextColor="#6b7280"
            value={explorerUrl}
            onChangeText={setExplorerUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Custom Network</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderColor: 'rgba(255,255,255,0.05)',
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
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#1b1b2a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '600',
  },
});
