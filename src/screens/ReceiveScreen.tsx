import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from '../components/QRCode';

export default function ReceiveScreen({ route, navigation }: any) {
  const token = route.params?.token || { symbol: 'USDT', name: 'Aptos USDT', price: 1.00, change: 0.0, icon: '💚', color: '#26a17b' };
  const userId = useWalletStore((state) => state.userId) || '0x2dff76d3614301dd6bc1600b3445d9ed2bbd6c812b0a2a96c5c5fadeabc06ace';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(userId);
    Alert.alert('Address Copied', 'Wallet address copied to clipboard successfully.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My CloudVoid wallet deposit address: ${userId}`
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Receive {token.symbol}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Warning Badge */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Send only {token.name} ({token.symbol}) assets to this address. Sending any other tokens will result in permanent loss.
          </Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrCard}>
          <View style={styles.qrBox}>
            <QRCode value={userId} size={200} />
          </View>
          <Text style={styles.qrDesc}>Scan to deposit {token.symbol}</Text>
        </View>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressTitle}>My Wallet Address</Text>
          <Text style={styles.addressText}>{userId}</Text>
        </View>

        {/* Action Toggles */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={20} color={CloudVoidTheme.colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.actionText}>Copy Address</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={CloudVoidTheme.colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.actionText}>Share Address</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 24,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  warningBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: 14,
    borderRadius: 12,
    width: '100%',
  },
  warningText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.warning,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  qrCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: CloudVoidTheme.colors.textPrimary,
    borderRadius: 16,
    padding: 16,
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
    width: 36,
    height: 36,
    borderWidth: 6,
    borderColor: '#000000',
    backgroundColor: CloudVoidTheme.colors.textPrimary,
  },
  qrPattern: {
    width: 80,
    height: 80,
    backgroundColor: '#000000',
    opacity: 0.85,
    borderRadius: 4,
  },
  qrDesc: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    fontWeight: '600',
  },
  addressContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textPrimary,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 14,
    height: 52,
  },
  actionText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 14,
    fontWeight: '600',
  },
});
