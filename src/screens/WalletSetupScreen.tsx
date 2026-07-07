import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';

export default function WalletSetupScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Insignia Banner */}
      <View style={styles.insigniaContainer}>
        <View style={styles.insigniaOuter}>
          <Text style={styles.insigniaGlyph}>☁️</Text>
        </View>
        <Text style={styles.appName}>CloudVoid</Text>
        <Text style={styles.subtitle}>Your Gateway to Web3</Text>
      </View>

      {/* Buttons Options */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.btn, styles.importBtn, CloudVoidTheme.shadows.neonDark]}
          onPress={() => navigation.navigate('ImportWallet')}
        >
          <Text style={styles.btnText}>Import Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.createBtn, CloudVoidTheme.shadows.neonViolet]}
          onPress={() => navigation.navigate('CreateWallet')}
        >
          <Text style={styles.btnText}>Create Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer footnote */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>CloudVoid is strictly non-custodial.</Text>
        <Text style={styles.footerText}>We never store, access, or hold your keys.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: CloudVoidTheme.layout.screenPadding,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 70,
  },
  insigniaContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  insigniaOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 2,
    borderColor: CloudVoidTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  insigniaGlyph: {
    fontSize: 36,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: CloudVoidTheme.colors.textPrimary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: CloudVoidTheme.colors.textSubHeader,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: CloudVoidTheme.layout.maxWidth,
    gap: 16,
  },
  btn: {
    width: '100%',
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  importBtn: {
    backgroundColor: CloudVoidTheme.colors.accentDark,
  },
  createBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: CloudVoidTheme.colors.btnText,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: CloudVoidTheme.colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
});
