import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import { CloudVoidTheme } from '../theme/tokens';

export default function CurrencySelectionScreen({ navigation }: any) {
  const { selectedCurrency, setCurrency } = useWalletStore((state) => state);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const handleSelect = (code: string) => {
    setCurrency(code);
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: typeof currencies[0] }) => {
    const isSelected = selectedCurrency === item.code;
    return (
      <TouchableOpacity 
        style={[styles.row, isSelected && styles.rowSelected]} 
        onPress={() => handleSelect(item.code)}
      >
        <View style={styles.left}>
          <View style={styles.symbolBox}>
            <Text style={styles.symbolText}>{item.symbol}</Text>
          </View>
          <View>
            <Text style={styles.codeText}>{item.code}</Text>
            <Text style={styles.nameText}>{item.name}</Text>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency Selection</Text>
        <View style={{ width: 80 }} />
      </View>

      <FlatList
        data={currencies}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  },
  listContent: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1b1b2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  symbolText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  codeText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  nameText: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
});
