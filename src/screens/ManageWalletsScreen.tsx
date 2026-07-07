import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';

interface WalletItem {
  id: string;
  name: string;
  address: string;
  status: string;
}

export default function ManageWalletsScreen({ navigation }: any) {
  const wallets = useWalletStore((state) => state.wallets);
  const deleteWallet = useWalletStore((state) => state.deleteWallet);
  
  const [selectedWalletToDelete, setSelectedWalletToDelete] = useState<any | null>(null);

  const renderWalletItem = ({ item }: { item: any }) => (
    <View style={styles.walletCard}>
      <View style={styles.cardLeft}>
        <View style={styles.vaultIconWrapper}>
          <MaterialCommunityIcons name="safe" size={28} color={CloudVoidTheme.colors.textPrimary} />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.walletName}>{item.name}</Text>
          <Text style={styles.walletAddress}>Address: {item.address}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status: </Text>
            <Text style={styles.statusValue}>{item.status}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => setSelectedWalletToDelete(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#9ca3af" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Wallets</Text>
        <View style={{ width: 80 }} />
      </View>

      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        renderItem={renderWalletItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No wallets connected.</Text>
        }
      />

      {/* Confirm Delete Bottom Pop-Up */}
      <Modal visible={selectedWalletToDelete !== null} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedWalletToDelete(null)}>
          <Pressable style={styles.actionSheetContainer}>
            <View style={styles.actionSheetContent}>
              <View style={styles.actionSheetHandle} />
              <Text style={styles.actionSheetTitle}>Confirm Delete</Text>
              <Text style={styles.actionSheetSubtitle}>This will not be reversed.</Text>

              <TouchableOpacity 
                style={styles.actionSheetDeleteBtn}
                onPress={() => {
                  if (selectedWalletToDelete) {
                    deleteWallet(selectedWalletToDelete.id);
                    setSelectedWalletToDelete(null);
                  }
                }}
              >
                <Text style={styles.actionSheetDeleteText}>Delete Wallet</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.actionSheetCancel} onPress={() => setSelectedWalletToDelete(null)}>
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
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
  walletCard: {
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vaultIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1f1f33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardDetails: {
    flex: 1,
  },
  walletName: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletAddress: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  statusValue: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  deleteText: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  // Modal / Action Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  actionSheetContent: {
    backgroundColor: 'rgba(240, 240, 245, 0.98)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionSheetSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionSheetDeleteBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetDeleteText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionSheetCancel: {
    backgroundColor: 'rgba(240, 240, 245, 0.98)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
