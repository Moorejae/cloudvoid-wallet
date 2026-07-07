import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '../stores/walletStore';

interface HardwareDevice {
  id: string;
  name: string;
}

export default function ConnectHardwareWalletScreen({ navigation }: any) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  
  const setUserId = useWalletStore((state) => state.setUserId);
  const setMnemonic = useWalletStore((state) => state.setMnemonic);

  useEffect(() => {
    startScan();
    return () => {
      // Cleanup BLE manager listeners here in a real integration
    };
  }, []);

  const startScan = () => {
    setIsScanning(true);
    setDevices([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // In a production environment, this is where you would initialize 
    // @ledgerhq/react-native-hw-transport-ble or react-native-ble-plx
    // e.g. bleManager.startDeviceScan(null, null, (error, device) => { ... })
    
    // Simulating discovered devices after a delay
    setTimeout(() => {
      setDevices((prev) => [...prev, { id: 'mac-1', name: 'Ledger Nano X 8A9B' }]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 2000);

    setTimeout(() => {
      setDevices((prev) => [...prev, { id: 'mac-2', name: 'Trezor Model T' }]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 4500);

    setTimeout(() => {
      setIsScanning(false);
    }, 10000);
  };

  const handleConnectDevice = async (device: HardwareDevice) => {
    setConnectingTo(device.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Simulate connection delay (exchange of APDU commands)
    setTimeout(async () => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // In production, we'd derive the public address using the hardware wallet's SDK
        const simulatedHardwareAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        
        // Register via API
        try {
          const response = await fetch('http://localhost:3000/api/wallet/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: simulatedHardwareAddress, importMethod: 'hardware_wallet' })
          });
          const data = await response.json();
          if (data.tokens) {
            useWalletStore.getState().setTokens(data.tokens);
          }
        } catch (apiError) {
          console.warn('API Registration failed:', apiError);
        }

        setUserId(simulatedHardwareAddress);
        // We don't store mnemonic for hardware wallets
        await setMnemonic('HARDWARE_WALLET_MANAGED');
        
        Alert.alert('Connected', `Successfully connected to ${device.name}.`, [
          { text: 'Continue', onPress: () => navigation.navigate('Wallet') }
        ]);

      } catch (error) {
        Alert.alert('Connection Failed', `Could not connect to ${device.name}. Ensure Bluetooth is on and the device is unlocked.`);
        setConnectingTo(null);
      }
    }, 2500);
  };

  const renderDevice = ({ item }: { item: HardwareDevice }) => (
    <TouchableOpacity 
      style={styles.deviceCard} 
      onPress={() => handleConnectDevice(item)}
      disabled={connectingTo !== null}
    >
      <View style={styles.deviceIconWrapper}>
        <Ionicons name="hardware-chip-outline" size={24} color={CloudVoidTheme.colors.accent} />
      </View>
      <View style={styles.deviceMeta}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceId}>ID: {item.id.toUpperCase()}</Text>
      </View>
      {connectingTo === item.id ? (
        <ActivityIndicator color={CloudVoidTheme.colors.accent} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={CloudVoidTheme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={connectingTo !== null}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Ionicons name="bluetooth" size={32} color={CloudVoidTheme.colors.textPrimary} style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Connect Hardware Wallet</Text>
        <Text style={styles.subtitle}>
          Ensure your Ledger or Trezor is powered on, unlocked, and has Bluetooth enabled.
        </Text>
      </View>

      <View style={styles.scanSection}>
        <View style={styles.scanHeaderRow}>
          <Text style={styles.scanTitle}>Available Devices</Text>
          {isScanning && !connectingTo && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="small" color={CloudVoidTheme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={styles.scanningText}>Scanning...</Text>
            </View>
          )}
        </View>

        {devices.length === 0 && !isScanning ? (
          <View style={styles.emptyState}>
            <Ionicons name="warning-outline" size={40} color={CloudVoidTheme.colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No devices found.</Text>
            <TouchableOpacity style={styles.rescanBtn} onPress={startScan}>
              <Text style={styles.rescanBtnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={renderDevice}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 50,
  },
  topBar: {
    paddingHorizontal: CloudVoidTheme.layout.screenPadding,
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: CloudVoidTheme.colors.backBtn,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: CloudVoidTheme.layout.screenPadding,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textSubHeader,
    lineHeight: 22,
  },
  scanSection: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: CloudVoidTheme.layout.screenPadding,
    paddingTop: 24,
  },
  scanHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textHeader,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 14,
    color: CloudVoidTheme.colors.accent,
    fontWeight: '500',
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  deviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceMeta: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textDisabled,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 24,
  },
  rescanBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  rescanBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
