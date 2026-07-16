import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function RegisterScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Secure your Void</Text>
        <Text style={styles.subtitle}>Choose how you want to establish your decentralized identity.</Text>
      </View>

      <View style={styles.optionsContainer}>
        {/* Create Wallet Option */}
        <TouchableOpacity 
          style={[styles.card, styles.createCard, CloudVoidTheme.shadows.neonViolet]}
          onPress={() => navigation.navigate('CreateWallet')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={32} color={CloudVoidTheme.colors.accent} />
            <Text style={styles.cardTitle}>Create New Wallet</Text>
          </View>
          <Text style={styles.cardDesc}>
            Generate a new, secure 12-word recovery phrase. This will be the master key to all your crypto assets.
          </Text>
        </TouchableOpacity>

        {/* Import Wallet Option */}
        <TouchableOpacity 
          style={[styles.card, styles.importCard, CloudVoidTheme.shadows.neonDark]}
          onPress={() => navigation.navigate('ImportWallet')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="key-outline" size={32} color={CloudVoidTheme.colors.textSecondary} />
            <Text style={styles.cardTitle}>Import Existing Wallet</Text>
          </View>
          <Text style={styles.cardDesc}>
            Enter your 12-word recovery phrase or private key to sync your existing addresses and assets.
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000000',
    padding: CloudVoidTheme.layout.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 40,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  titleSection: {
    width: '100%',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textSubHeader,
    lineHeight: 22,
  },
  optionsContainer: {
    width: '100%',
    gap: 20,
  },
  card: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  createCard: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  importCard: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  cardDesc: {
    fontSize: 14,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 20,
  },
});
