import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from '../components/QRCode';
import jsQR from 'jsqr';

export default function QRModalScreen({ route, navigation }: any) {
  const token = route.params?.token || { symbol: 'USDT', name: 'Aptos USDT', icon: '💚' };
  const initialMode = route.params?.mode || 'qr';

  const [mode, setMode] = useState<'qr' | 'scan'>(initialMode);
  const [manualAddress, setManualAddress] = useState('');
  const [scanStatus, setScanStatus] = useState('Ready to scan');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const userId = useWalletStore((state) => state.userId) || '0x2dff76d3614301dd6bc1600b3445d9ed2bbd6c812b0a2a96c5c5fadeabc06ace';

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(userId);
    Alert.alert('Copied', 'Address copied to clipboard!');
  };

  const handleUseScannedAddress = (scanned: string) => {
    const candidate = scanned.trim();
    if (!candidate) {
      Alert.alert('Scan failed', 'No wallet address was detected in the QR code.');
      return;
    }

    setManualAddress(candidate);
    setScanStatus(`Detected ${candidate.slice(0, 12)}...`);
    Alert.alert('Wallet address detected', `Detected: ${candidate}`);
    stopCamera();
  };

  const scanFrameWithJsqr = (video: HTMLVideoElement): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      return result?.data || null;
    } catch {
      return null;
    }
  };

  const startWebScan = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setScanStatus('Web camera is unavailable on this browser. Paste a wallet address manually.');
      return;
    }

    setIsScanning(true);
    setScanStatus('Opening camera…');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Chrome/Edge have a native BarcodeDetector; every other browser uses jsQR.
      const detector = (window as any).BarcodeDetector || (window as any).barcodeDetector;
      const useJsqr = !detector;

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        if (attempts > 140 || !videoRef.current) {
          clearInterval(interval);
          setIsScanning(false);
          setScanStatus('No QR code found. Paste a wallet address manually.');
          return;
        }

        try {
          let raw = '';
          if (useJsqr) {
            raw = scanFrameWithJsqr(videoRef.current) || '';
          } else {
            const barcodes = await detector.detect(videoRef.current);
            raw = barcodes && barcodes.length > 0 ? (barcodes[0].rawValue || barcodes[0].value || '') : '';
          }
          if (raw) {
            clearInterval(interval);
            setIsScanning(false);
            handleUseScannedAddress(raw);
          }
        } catch {
          // Ignore transient detection failures and retry.
        }
      }, 350);
    } catch (err) {
      setIsScanning(false);
      setScanStatus('Camera access blocked. Paste a wallet address manually instead.');
      console.warn('QR camera error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {mode === 'qr' ? 'My QR Code' : 'Scan Code'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

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
          <View style={styles.qrWrapper}>
            <View style={styles.qrCard}>
              <QRCode value={userId} size={190} />
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
          <View style={styles.scanWrapper}>
            <View style={styles.scannerFrame}>
              <View style={styles.scannerBox}>
                <video ref={videoRef} style={styles.videoPreview} playsInline muted />
                <View style={styles.scannerTarget} />
                <Text style={styles.scannerHelp}>{scanStatus}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.connectBtn, isScanning && styles.connectBtnDisabled]}
              onPress={!isScanning ? startWebScan : undefined}
              disabled={isScanning}
            >
              <Text style={styles.connectBtnText}>{isScanning ? 'Scanning…' : 'Open Camera'}</Text>
            </TouchableOpacity>

            <Text style={styles.manualLabel}>Or paste a wallet address manually</Text>
            <TextInput
              style={styles.input}
              placeholder="0x... or wallet address"
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              value={manualAddress}
              onChangeText={setManualAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                if (!manualAddress.trim()) {
                  Alert.alert('Address required', 'Paste or type a wallet address first.');
                  return;
                }
                Alert.alert('Address ready', `Using wallet address: ${manualAddress}`);
              }}
            >
              <Text style={styles.secondaryBtnText}>Use Address</Text>
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
    backgroundColor: CloudVoidTheme.colors.textPrimary,
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
    backgroundColor: CloudVoidTheme.colors.textPrimary,
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
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#000',
  },
  connectBtn: {
    width: '100%',
    backgroundColor: CloudVoidTheme.colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  connectBtnDisabled: {
    opacity: 0.6,
  },
  connectBtnText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  manualLabel: {
    marginTop: 22,
    alignSelf: 'flex-start',
    color: CloudVoidTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    width: '100%',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    color: CloudVoidTheme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 14,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    color: CloudVoidTheme.colors.accent,
    fontWeight: '700',
    fontSize: 14,
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
