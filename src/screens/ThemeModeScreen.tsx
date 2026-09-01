import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../stores/walletStore';
import { CloudVoidTheme, applyTheme } from '../theme/tokens';

export default function ThemeModeScreen({ navigation }: any) {
  const { theme, setTheme } = useWalletStore((state) => state);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>(theme);

  const handleSave = () => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
    Alert.alert('Success', `Theme preference saved as ${selectedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}!`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme Mode</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardsRow}>
          {/* Dark Mode Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard, 
              styles.darkCard, 
              selectedTheme === 'dark' && styles.cardSelectedDark
            ]}
            onPress={() => setSelectedTheme('dark')}
            activeOpacity={0.9}
          >
            <Ionicons name="moon" size={32} color="#a78bfa" style={styles.icon} />
            <Text style={styles.darkCardTitle}>Dark Mode</Text>
            <Text style={styles.darkCardDesc}>
              Deep Obsidian (#0b0b0c) and Violet accents. Maximizes battery life and eye comfort.
            </Text>
            
            <View style={[styles.radioCircle, selectedTheme === 'dark' && styles.radioCircleActiveDark]}>
              {selectedTheme === 'dark' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Light Mode Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard, 
              styles.lightCard, 
              selectedTheme === 'light' && styles.cardSelectedLight
            ]}
            onPress={() => setSelectedTheme('light')}
            activeOpacity={0.9}
          >
            <Ionicons name="sunny" size={32} color="#6d28d9" style={styles.icon} />
            <Text style={styles.lightCardTitle}>Light Mode</Text>
            <Text style={styles.lightCardDesc}>
              Pure White and Soft Violet accents. High visibility and clear contrast.
            </Text>
            
            <View style={[styles.radioCircle, selectedTheme === 'light' && styles.radioCircleActiveLight]}>
              {selectedTheme === 'light' && <View style={styles.radioInnerLight} />}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Theme Preference</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  themeCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 320,
    borderWidth: 2,
  },
  darkCard: {
    backgroundColor: '#0b0b0c',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  lightCard: {
    backgroundColor: CloudVoidTheme.colors.textPrimary,
    borderColor: '#e5e7eb',
  },
  cardSelectedDark: {
    borderColor: '#8b5cf6',
  },
  cardSelectedLight: {
    borderColor: '#6d28d9',
  },
  icon: {
    marginBottom: 16,
  },
  darkCardTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  lightCardTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  darkCardDesc: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  lightCardDesc: {
    color: '#4b5563',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  radioCircleActiveDark: {
    borderColor: '#a78bfa',
  },
  radioCircleActiveLight: {
    borderColor: '#6d28d9',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#a78bfa',
  },
  radioInnerLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: CloudVoidTheme.colors.bg,
  },
  saveBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '600',
  },
});
