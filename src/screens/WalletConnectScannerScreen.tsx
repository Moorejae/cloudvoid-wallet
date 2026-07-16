import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { useWalletConnectStore } from '../stores/walletConnectStore';
import * as Haptics from 'expo-haptics';
import { Camera, CameraView } from 'expo-camera';

export default function WalletConnectScannerScreen() {
  const navigation = useNavigation<any>();
  const [uri, setUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  
  const pair = useWalletConnectStore(state => state.pair);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: any) => {
    setScanned(true);
    setUri(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('QR Scanned', 'WalletConnect URI successfully scanned. Click Connect to link.');
  };

  const handleMockScanSuccess = () => {
    const mockWcUri = 'wc:mock_session_' + Math.random().toString(36).substring(7);
    setUri(mockWcUri);
    Alert.alert('Mock Scan Success', 'Mocked WalletConnect QR Code.');
  };

  const handleConnect = async () => {
    if (!uri.startsWith('wc:')) {
      Alert.alert('Invalid URI', 'Please enter a valid WalletConnect URI starting with wc:');
      return;
    }

    setIsConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Simulate pairing delay
      await new Promise(res => setTimeout(res, 1500));
      const success = await pair(uri);
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Connected', 'Successfully connected to dApp');
        navigation.goBack();
      } else {
        throw new Error('Pairing failed');
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Connection Failed', 'Failed to pair with the provided URI.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect to dApp</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.scannerWrapper}>
          {Platform.OS !== 'web' && hasPermission ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
          ) : (
            <TouchableOpacity onPress={handleMockScanSuccess} style={styles.mockScannerArea}>
              <Ionicons name="qr-code-outline" size={80} color={CloudVoidTheme.colors.primary} />
              <Text style={styles.scannerText}>
                (Camera disabled on web - Tap to Mock)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.manualLabel}>Or paste WalletConnect URI:</Text>
        <TextInput
          style={styles.input}
          placeholder="wc:123456789..."
          placeholderTextColor={CloudVoidTheme.colors.textDisabled}
          value={uri}
          onChangeText={setUri}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity 
          style={[
            styles.connectBtn, 
            (!uri || isConnecting) && styles.connectBtnDisabled
          ]}
          onPress={handleConnect}
          disabled={!uri || isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.connectBtnText}>Connect</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050514',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  mockScannerArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerWrapper: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(59, 153, 252, 0.3)',
    borderRadius: 24,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(59, 153, 252, 0.05)',
  },
  scannerText: {
    color: CloudVoidTheme.colors.textSecondary,
    marginTop: 16,
    fontSize: 14,
  },
  manualLabel: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
  },
  connectBtn: {
    width: '100%',
    backgroundColor: CloudVoidTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectBtnDisabled: {
    opacity: 0.5,
  },
  connectBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  }
});
