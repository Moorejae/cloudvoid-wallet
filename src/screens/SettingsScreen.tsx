import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import * as Linking from 'expo-linking';
import { TRANSLATIONS } from '../utils/translations';
import { CloudVoidTheme } from '../theme/tokens';
import { checkForUpdates } from '../services/updates';

export default function SettingsScreen({ navigation }: any) {
  const {
    isBiometricEnabled,
    isScreenshotBlocked,
    selectedCurrency,
    selectedLanguage,
    setBiometricEnabled,
    setScreenshotBlocked,
    setCurrency,
    setLanguage,
    wipeWallet,
    isVerified,
    setIsVerified
  } = useWalletStore((state) => state);

  // ── Platform differentiation ──
  // The web build cannot use OS biometrics, screen-capture blocking, or OS
  // SecureStore — the mobile (Expo APK) build can. We surface the right options
  // per platform so users never see a dead switch.
  const isWeb = Platform.OS === 'web';
  const platformLabel = isWeb ? 'Web App' : 'Mobile App (APK)';
  const platformCaption = isWeb
    ? 'Browser vault + password encryption'
    : 'OS biometrics + SecureStore encryption';

  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  // Toggle screenshot-block (native only — no-op on web)
  const handleToggleScreenshotBlock = async (value: boolean) => {
    if (isWeb) return;
    setScreenshotBlocked(value);
    try {
      if (value) await ScreenCapture.preventScreenCaptureAsync();
      else await ScreenCapture.allowScreenCaptureAsync();
    } catch (e) {
      console.warn('screen-capture toggle failed:', e);
    }
  };

  // Check GitHub for a newer APK build (auto-updated on every push)
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const handleCheckUpdates = async () => {
    if (checkingUpdates) return;
    setCheckingUpdates(true);
    const info = await checkForUpdates();
    setCheckingUpdates(false);

    if (isWeb) {
      Alert.alert('Check for Updates', 'This is the web build — the APK auto-updates from GitHub. Latest build: ' + (info.latestVersion || 'unknown'));
      return;
    }

    if (info.updateAvailable && info.releaseUrl) {
      Alert.alert(
        'Update Available',
        `You're on build ${info.currentVersionCode}. A newer build (${info.latestVersion}) is ready.\n\n${info.releaseNotes ? info.releaseNotes.split('\n')[0] : ''}`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Download', onPress: () => Linking.openURL(info.releaseUrl || '') },
        ]
      );
    } else if (info.latestVersion) {
      Alert.alert('You\u2019re up to date', `You're on the latest build (${info.latestVersion}).`);
    } else {
      Alert.alert('Check Failed', 'Could not reach GitHub. Check your connection and try again.');
    }
  };

  const t = (Platform.OS === 'web' && selectedLanguage !== 'English')
    ? TRANSLATIONS.English 
    : (TRANSLATIONS[selectedLanguage] || TRANSLATIONS.English);

  // Toggles for Notification (mock state)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isMainnetSelected, setIsMainnetSelected] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle Biometric Lock
  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setBiometricError('You do not have biometrics set up on your device. Set up biometrics on your device before it can actually work here.');
        setTimeout(() => setBiometricError(null), 4000);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authorize Biometrics'
      });
      if (result.success) {
        setBiometricEnabled(true);
      } else {
        setBiometricEnabled(false);
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleLogout = async () => {
    await wipeWallet();
    // AppNavigator will automatically bounce user to Welcome if wallet goes uninitialized
  };

  const handleVerification = () => {
    if (isVerified) {
      Alert.alert('Verified', 'Your account is already verified.');
    } else {
      Alert.alert(
        'Account Verification',
        'Verify your account to access FiatHub services.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => setIsVerified(true) }
        ]
      );
    }
  };

  const closeSheet = () => setActiveSheet(null);

  const renderItem = (icon: any, title: string, subtitle: string, sheetName: string, isDestructive = false) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => {
        if (sheetName === 'Logout') {
          handleLogout();
        } else if (sheetName === 'Verification') {
          handleVerification();
        } else if (sheetName === 'Updates') {
          handleCheckUpdates();
        } else {
          setActiveSheet(sheetName);
        }
      }}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={isDestructive ? '#ef4444' : '#8b5cf6'} />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, isDestructive && { color: '#ef4444' }]}>{title}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDestructive ? '#ef4444' : '#4b5563'} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <View style={{ width: 80 }} />
      </View>

      {biometricError && (
        <View style={styles.errorToast}>
          <Ionicons name="warning" size={20} color={CloudVoidTheme.colors.textPrimary} style={{marginRight: 8}} />
          <Text style={styles.errorToastText}>{biometricError}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderItem(
          isVerified ? 'checkmark-circle' : 'alert-circle-outline', 
          'Account Verification', 
          isVerified ? 'Verified Account' : 'Verify ID for FiatHub', 
          'Verification',
          false
        )}
        {renderItem(
          isWeb ? 'globe-outline' : 'phone-portrait-outline',
          'Platform',
          platformCaption,
          'Platform'
        )}
        {renderItem(
          'cloud-download-outline',
          checkingUpdates ? 'Checking for updates…' : 'Check for Updates',
          'Fetches the latest APK from GitHub',
          'Updates'
        )}
        {renderItem('shield-checkmark-outline', t.security, t.securitySub, 'Security')}
        {renderItem('notifications-outline', t.notifications, t.notificationsSub, 'Notification')}
        {renderItem('git-network-outline', t.network, t.networkSub, 'Network')}
        {renderItem('wallet-outline', t.wallet, t.walletSub, 'Wallet')}
        {renderItem('options-outline', t.prefs, t.prefsSub, 'Preferences')}
        {renderItem('hammer-outline', t.legal, t.legalSub, 'Legal')}
        {renderItem('log-out-outline', t.logout, t.logoutSub, 'Logout', true)}
      </ScrollView>

      {/* Dynamic Bottom Sheet */}
      <Modal visible={activeSheet !== null} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={closeSheet}>
          {activeSheet === 'Security' ? (
            <Pressable style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>Security & Access</Text>
                <Text style={styles.actionSheetCaption}>
                  {isWeb ? 'Web build — no OS biometrics. Your seed is protected by your vault password.' : 'Mobile build — uses your device security hardware.'}
                </Text>

                {!isWeb && (
                  <>
                    <View style={styles.actionSheetItem}>
                      <View style={styles.actionSheetItemLeft}>
                        <Ionicons name="scan-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.actionSheetItemTitle}>Biometric Unlock</Text>
                          <Text style={styles.actionSheetItemSub}>(Fingerprint / Face)</Text>
                        </View>
                      </View>
                      <Switch
                        value={isBiometricEnabled}
                        onValueChange={handleToggleBiometrics}
                        trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                      />
                    </View>

                    <View style={styles.actionSheetDivider} />

                    <View style={styles.actionSheetItem}>
                      <View style={styles.actionSheetItemLeft}>
                        <Ionicons name="eye-off-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.actionSheetItemTitle}>Block Screen Capture</Text>
                          <Text style={styles.actionSheetItemSub}>Prevent screenshots of your wallet</Text>
                        </View>
                      </View>
                      <Switch
                        value={isScreenshotBlocked}
                        onValueChange={handleToggleScreenshotBlock}
                        trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                      />
                    </View>

                    <View style={styles.actionSheetDivider} />
                  </>
                )}

                {isWeb && (
                  <>
                    <View style={styles.actionSheetItem}>
                      <View style={styles.actionSheetItemLeft}>
                        <Ionicons name="scan-outline" size={24} color="rgba(255,255,255,0.25)" style={{marginRight: 12}} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.actionSheetItemTitle, { opacity: 0.5 }]}>Biometric Unlock</Text>
                          <Text style={styles.actionSheetItemSub}>Only available in the mobile app (APK)</Text>
                        </View>
                      </View>
                      <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.3)" />
                    </View>

                    <View style={styles.actionSheetDivider} />
                  </>
                )}

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { 
                  closeSheet(); 
                  setTimeout(() => {
                    navigation.navigate('TwoFASetup');
                  }, 50);
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="keypad" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>2FA Setup</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionSheetCancel} onPress={closeSheet}>
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          ) : activeSheet === 'Platform' ? (
            <Pressable style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>Platform: {platformLabel}</Text>
                <Text style={styles.actionSheetCaption}>
                  CloudVoid ships as both a web app and a mobile APK. Features differ by platform.
                </Text>

                <View style={styles.platformRow}>
                  <Ionicons name="globe-outline" size={20} color="#8b5cf6" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.actionSheetItemTitle}>Web App</Text>
                    <Text style={styles.actionSheetItemSub}>Vault password (PBKDF2 + AES-256-GCM) · No OS biometrics · No screenshot block</Text>
                  </View>
                </View>

                <View style={styles.actionSheetDivider} />

                <View style={styles.platformRow}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#8b5cf6" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.actionSheetItemTitle}>Mobile App (APK)</Text>
                    <Text style={styles.actionSheetItemSub}>OS biometric unlock · SecureStore key storage · Screen-capture blocking</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.actionSheetCancel} onPress={closeSheet}>
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          ) : activeSheet === 'Network' ? (
            <Pressable style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>Network Selection</Text>
                
                <View style={styles.actionSheetItem}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="globe-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Select Mainnet Network</Text>
                  </View>
                  <Switch
                    value={isMainnetSelected}
                    onValueChange={setIsMainnetSelected}
                    trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                  />
                </View>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { 
                  closeSheet(); 
                  setTimeout(() => navigation.navigate('AddCustomRPC'), 50); 
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="add-circle-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Add Custom RPC</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { 
                  closeSheet(); 
                  setTimeout(() => navigation.navigate('LocalLatencyPings'), 50); 
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="wifi-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Local Latency Pings (RPC)</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionSheetCancel} onPress={closeSheet}>
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          ) : activeSheet === 'Notification' ? (
            <Pressable style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>Notification Center</Text>
                
                <View style={styles.actionSheetItem}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="notifications-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Push Notifications</Text>
                  </View>
                  <Switch
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                  />
                </View>

                <View style={styles.actionSheetDivider} />

                <View style={styles.actionSheetItem}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="mail-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Email Alerts</Text>
                  </View>
                  <Switch
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                    trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.actionSheetCancel} onPress={closeSheet}>
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          ) : activeSheet === 'Wallet' ? (
            <Pressable style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>Wallet Management</Text>
                
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => {
                  closeSheet();
                  setTimeout(() => {
                    navigation.navigate('ManageWallets');
                  }, 50);
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="wallet-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Manage Wallets</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => {
                  closeSheet();
                  setTimeout(() => {
                    navigation.navigate('MoneroViewer');
                  }, 50);
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="eye-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Monero Wallet Viewer</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionSheetCancel} onPress={closeSheet}>
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          ) : activeSheet === 'Preferences' ? (
            <Pressable style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>App Preferences</Text>
                
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => {
                  closeSheet();
                  setTimeout(() => navigation.navigate('CurrencySelection'), 50);
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <View style={styles.textIconWrapper}>
                      <Text style={styles.textIcon}>$₦</Text>
                    </View>
                    <Text style={styles.actionSheetItemTitle}>Currency Selection</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => {
                  closeSheet();
                  setTimeout(() => navigation.navigate('LanguageSelection'), 50);
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="globe-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Language Selection</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => {
                  closeSheet();
                  setTimeout(() => {
                    navigation.navigate('ThemeMode');
                  }, 50);
                }}>
                  <View style={styles.actionSheetItemLeft}>
                    <Ionicons name="sunny-outline" size={24} color={CloudVoidTheme.colors.textPrimary as any} style={{marginRight: 12}} />
                    <Text style={styles.actionSheetItemTitle}>Theme Mode</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionSheetCancel} onPress={closeSheet}>
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          ) : (
            <Pressable style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              
              {activeSheet === 'Legal' && (
                <View>
                  <Text style={styles.sheetTitle}>Legal & Compliance</Text>
                  <TouchableOpacity style={styles.sheetActionBtn} onPress={() => { closeSheet(); navigation.navigate('LegalDocument', { documentType: 'terms' }); }}>
                    <Text style={styles.sheetActionText}>Terms of Service</Text>
                    <Ionicons name="document-text-outline" size={20} color="#a78bfa" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sheetActionBtn} onPress={() => { closeSheet(); navigation.navigate('LegalDocument', { documentType: 'conduct' }); }}>
                    <Text style={styles.sheetActionText}>Code of Conduct</Text>
                    <Ionicons name="document-text-outline" size={20} color="#a78bfa" />
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>
          )}
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
  textIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CloudVoidTheme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTextContainer: {
    justifyContent: 'center',
  },
  itemTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: CloudVoidTheme.colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  sheetDesc: {
    color: CloudVoidTheme.colors.textSubHeader,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 22,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sheetRowText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  sheetActionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    marginBottom: 12,
  },
  sheetActionText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CloudVoidTheme.colors.border,
  },
  pingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pingText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 14,
  },
  subHeading: {
    color: CloudVoidTheme.colors.textSubHeader,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CloudVoidTheme.colors.surface,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  chipText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
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
  actionSheetCaption: {
    fontSize: 12.5,
    color: '#6b7280',
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 18,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
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
  errorToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 16,
    right: 16,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorToastText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});
