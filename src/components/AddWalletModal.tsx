import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Pressable, Platform, ScrollView } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateCreate: () => void;
  onNavigateImport: () => void;
  onNavigateHardwareWallet: () => void;
  onTriggerToast: (msg: string) => void;
}

export default function AddWalletModal({
  isOpen,
  onClose,
  onNavigateCreate,
  onNavigateImport,
  onNavigateHardwareWallet,
  onTriggerToast
}: AddWalletModalProps) {
  const [modalView, setModalView] = useState<'options' | 'switch'>('options');
  
  const wallets = useWalletStore((state) => state.wallets);
  const activeWalletId = useWalletStore((state) => state.activeWalletId) || '1';
  const setActiveWalletId = useWalletStore((state) => state.setActiveWalletId);

  // Reset to default options view when closed
  useEffect(() => {
    if (!isOpen) {
      setModalView('options');
    }
  }, [isOpen]);

  const handleStubClick = (feature: string) => {
    onTriggerToast(`${feature} coming soon!`);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.actionSheetContainer}>
          <View style={styles.actionSheetContent}>
            <View style={styles.actionSheetHandle} />
            
            {modalView === 'options' ? (
              <>
                <Text style={styles.actionSheetTitle}>Import Wallet</Text>

                <TouchableOpacity 
                  style={styles.actionSheetItem}
                  onPress={() => {
                    onClose();
                    onNavigateCreate();
                  }}
                >
                  <View style={styles.actionSheetItemLeft}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionSheetItemTitle}>Create New Wallet</Text>
                      <Text style={styles.actionSheetItemSub}>Generate a new BIP-39 mnemonic seed phrase</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity 
                  style={styles.actionSheetItem}
                  onPress={() => {
                    onClose();
                    onNavigateImport();
                  }}
                >
                  <View style={styles.actionSheetItemLeft}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionSheetItemTitle}>Import Existing Wallet</Text>
                      <Text style={styles.actionSheetItemSub}>Enter a seed phrase or private key</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity 
                  style={styles.actionSheetItem}
                  onPress={() => {
                    onClose();
                    onNavigateHardwareWallet();
                  }}
                >
                  <View style={styles.actionSheetItemLeft}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionSheetItemTitle}>Connect Hardware Wallet</Text>
                      <Text style={styles.actionSheetItemSub}>Sync Ledger or Trezor via Bluetooth</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity 
                  style={styles.actionSheetItem}
                  onPress={() => setModalView('switch')}
                >
                  <View style={styles.actionSheetItemLeft}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionSheetItemTitle}>Switch Active Wallet</Text>
                      <Text style={styles.actionSheetItemSub}>Switch between currently connected accounts</Text>
                    </View>
                  </View>
                  <Ionicons name="swap-horizontal" size={20} color={CloudVoidTheme.colors.accent} style={{ marginRight: 4 }} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.switchHeader}>
                  <TouchableOpacity onPress={() => setModalView('options')} style={styles.backBtnInline}>
                    <Ionicons name="chevron-back" size={20} color={CloudVoidTheme.colors.accent} />
                  </TouchableOpacity>
                  <Text style={[styles.actionSheetTitle, { marginBottom: 0, flex: 1, marginRight: 20 }]}>Select Wallet</Text>
                </View>

                <ScrollView style={styles.walletListScroll} showsVerticalScrollIndicator={false}>
                  {wallets.map((wallet, index) => {
                    const isActive = wallet.id === activeWalletId;
                    return (
                      <View key={wallet.id}>
                        {index > 0 && <View style={styles.actionSheetDivider} />}
                        <TouchableOpacity 
                          style={styles.actionSheetItem}
                          onPress={() => {
                            setActiveWalletId(wallet.id);
                            onClose();
                          }}
                        >
                          <View style={styles.actionSheetItemLeft}>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.actionSheetItemTitle, isActive && { color: '#a78bfa' }]}>{wallet.name}</Text>
                              <Text style={styles.actionSheetItemSub}>{wallet.address}</Text>
                            </View>
                          </View>
                          {isActive && <Ionicons name="checkmark-circle" size={20} color={CloudVoidTheme.colors.success} />}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.actionSheetCancel} onPress={onClose}>
            <Text style={styles.actionSheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  actionSheetContent: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
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
    fontSize: 16,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionSheetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionSheetItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
  },
  actionSheetItemSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    paddingRight: 16,
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  actionSheetCancel: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  actionSheetCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  backBtnInline: {
    padding: 4,
  },
  walletListScroll: {
    maxHeight: 250,
  },
});
