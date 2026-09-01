import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthBackgroundVideo from '../components/AuthBackgroundVideo';

export default function WelcomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <AuthBackgroundVideo overlayOpacity={isDesktop ? 0.5 : 0.6}>
      <View style={[styles.container, isDesktop && styles.desktopContainer]}>
        {/* Original CloudVoid Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/cloudvoid_logo.png')}
            style={[styles.cleanLogo, isDesktop && styles.cleanLogoDesktop]}
            resizeMode="contain"
          />
        </View>

        {/* 100% Decentralized Actions */}
        <View style={styles.actionGroup}>
          <TouchableOpacity 
            style={styles.primaryCreateBtn}
            onPress={() => navigation.navigate('CreateWallet')}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryCreateBtnText}>Create New Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryImportBtn}
            onPress={() => navigation.navigate('ImportWallet')}
            activeOpacity={0.8}
          >
            <Ionicons name="key-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryImportBtnText}>I already have a wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.unlockLinkBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.unlockLinkText}>
              Need to restore from backup or password? <Text style={styles.unlockHighlight}>Unlock</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthBackgroundVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 45,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  desktopContainer: {
    maxWidth: 540,
    paddingVertical: 55,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cleanLogo: {
    width: 150,
    height: 150,
  },
  cleanLogoDesktop: {
    width: 180,
    height: 180,
  },
  actionGroup: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  primaryCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    width: '100%',
    height: 56,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  primaryCreateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    width: '100%',
    height: 54,
  },
  secondaryImportBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  unlockLinkBtn: {
    paddingVertical: 8,
  },
  unlockLinkText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unlockHighlight: {
    color: '#A78BFA',
    fontWeight: '700',
  },
});
