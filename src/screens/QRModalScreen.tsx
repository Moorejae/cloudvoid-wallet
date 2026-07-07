import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function QRModalScreen({ route, navigation }: any) {
  const token = route.params?.token || { symbol: 'USDT', name: 'Aptos USDT', icon: '💚' };
  const initialMode = route.params?.mode || 'qr';
  
  const [mode, setMode] = useState<'qr' | 'scan'>(initialMode);
  const userId = useWalletStore((state) => state.userId) || '0x2dff76d3614301dd6bc1600b3445d9ed2bbd6c812b0a2a96c5c5fadeabc06ace';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(userId);
    Alert.alert('Copied', 'Address copied to clipboard!');
  };

  const handleMockScanSuccess = () => {
    const mockScannedAddress = '0x' + Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);
    Alert.alert('QR Scanned', `Scanned Address: ${mockScannedAddress}`);
    // Navigate to send screen pre-filled
    navigation.replace('Send', { token, address: mockScannedAddress });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {mode === 'qr' ? 'My QR Code' : 'Scan Code'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mode Toggle Switch */}
      <View style={styles.toggleRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, mode === 'qr' ? styles.activeToggle : null]}
          onPress={() => setMode('qr')}
        >
          <Text style={[styles.toggleText, mode === 'qr' ? styles.activeText : null]}>My Code</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, mode === 'scan' ? styles.activeToggle : null]}
          onPress={() => setMode('scan')}
        >
          <Text style={[styles.toggleText, mode === 'scan' ? styles.activeText : null]}>Scan Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === 'qr' ? (
          /* DISPLAY QR CODE MODE */
          <View style={styles.qrWrapper}>
            <View style={styles.qrCard}>
              <View style={styles.qrPlaceholder}>
                <View style={styles.qrGrid}>
                  <View style={[styles.qrCorner, { top: 0, left: 0 }]} />
                  <View style={[styles.qrCorner, { top: 0, right: 0 }]} />
                  <View style={[styles.qrCorner, { bottom: 0, left: 0 }]} />
                  <View style={styles.qrCore} />
                </View>
              </View>
              <Text style={styles.tokenMeta}>{token.icon} {token.symbol}</Text>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressText} numberOfLines={1}>{userId}</Text>
              <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color={CloudVoidTheme.colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* SCAN QR CODE MODE */
          <View style={styles.scanWrapper}>
            <View style={styles.scannerFrame}>
              <View style={styles.scannerBox}>
                <View style={styles.scannerTarget} />
                <Text style={styles.scannerHelp}>Center the QR code within the frame</Text>
              </View>
            </View>

            {/* Mock Trigger Button */}
            <TouchableOpacity 
              style={styles.mockScanBtn}
              onPress={handleMockScanSuccess}
            >
              <Text style={styles.mockScanBtnText}>Simulate QR Scan Success</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    marginBottom: 40,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#2a2a2a',
  },
  toggleText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
  },
  activeText: {
    color: CloudVoidTheme.colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  qrCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundcolor: CloudVoidTheme.colors.textPrimary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  qrGrid: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 5,
    borderColor: '#000000',
    backgroundcolor: CloudVoidTheme.colors.textPrimary,
  },
  qrCore: {
    width: 60,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  tokenMeta: {
    fontSize: 15,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    width: '100%',
    justifyContent: 'space-between',
  },
  addressText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyBtn: {
    padding: 4,
  },
  scanWrapper: {
    alignItems: 'center',
    width: '100%',
    gap: 30,
  },
  scannerFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: CloudVoidTheme.colors.accent,
    borderRadius: 24,
    padding: 6,
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  scannerBox: {
    flex: 1,
    backgroundColor: 'rgba(139,92,246,0.05)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scannerTarget: {
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  scannerHelp: {
    position: 'absolute',
    bottom: -40,
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  mockScanBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  mockScanBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
