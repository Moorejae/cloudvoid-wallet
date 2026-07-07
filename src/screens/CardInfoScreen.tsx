import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function CardInfoScreen({ navigation }: any) {
  const [activeAddress, setActiveAddress] = useState<'nigerian' | 'issuer'>('nigerian');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Information</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Toggle Switch */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeAddress === 'nigerian' ? styles.activeToggleBtn : null]}
            onPress={() => setActiveAddress('nigerian')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeAddress === 'nigerian' ? styles.activeToggleText : null]}>
              Nigerian Address
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleBtn, activeAddress === 'issuer' ? styles.activeToggleBtn : null]}
            onPress={() => setActiveAddress('issuer')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeAddress === 'issuer' ? styles.activeToggleText : null]}>
              Issuer Address
            </Text>
          </TouchableOpacity>
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <Text style={styles.label}>{activeAddress === 'nigerian' ? 'My Address' : 'Issuer Address'}</Text>
          {activeAddress === 'nigerian' ? (
            <>
              <Text style={styles.addressText}>15A Ademola Street</Text>
              <Text style={styles.addressText}>Ikoyi, Lagos State</Text>
              <Text style={styles.addressText}>101233</Text>
              <Text style={styles.addressText}>Nigeria</Text>
            </>
          ) : (
            <>
              <Text style={styles.addressText}>1209 Orange Street</Text>
              <Text style={styles.addressText}>Wilmington, Delaware</Text>
              <Text style={styles.addressText}>19801</Text>
              <Text style={styles.addressText}>United States</Text>
            </>
          )}
        </View>

        {/* Card Details */}
        <View style={styles.cardDetailsSection}>
          {/* Full Card Number */}
          <View style={styles.detailBlock}>
            <View style={styles.detailHeaderRow}>
              <Text style={styles.label}>Full Card Number</Text>
              <Text style={styles.copyLabel}>Copy</Text>
            </View>
            <View style={styles.detailValueRow}>
              <Text style={styles.valueText}>4123 5678 1234 9012</Text>
              <TouchableOpacity style={styles.copyIconBtn}>
                <Ionicons name="copy-outline" size={20} color="#a78bfa" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CVC */}
          <View style={styles.detailBlock}>
            <View style={styles.detailHeaderRow}>
              <Text style={styles.label}>CVC / CVV</Text>
            </View>
            <View style={styles.detailValueRow}>
              <Text style={styles.valueText}>482</Text>
              <TouchableOpacity style={styles.copyIconBtn}>
                <Ionicons name="copy-outline" size={20} color="#a78bfa" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiry Date */}
          <View style={styles.detailBlock}>
            <View style={styles.detailHeaderRow}>
              <Text style={styles.label}>Expiry Date</Text>
            </View>
            <View style={styles.detailValueRow}>
              <Text style={styles.valueText}>08 / 28</Text>
              <TouchableOpacity style={styles.copyIconBtn}>
                <Ionicons name="copy-outline" size={20} color="#a78bfa" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </View>
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    marginBottom: 32,
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
  headerRight: {
    width: 80,
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 4,
    borderRadius: CloudVoidTheme.radii.pill,
    marginBottom: 40,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: CloudVoidTheme.radii.pill,
  },
  activeToggleBtn: {
    backgroundColor: '#a78bfa',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeToggleText: {
    color: '#222332',
    fontWeight: '600',
  },
  addressSection: {
    marginBottom: 48,
  },
  label: {
    color: '#8e8f96',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 6,
  },
  addressText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  cardDetailsSection: {
    gap: 28,
  },
  detailBlock: {
    flexDirection: 'column',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  copyLabel: {
    color: '#8e8f96',
    fontSize: 12,
    fontWeight: '400',
  },
  detailValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyIconBtn: {
    padding: 4,
  },
});
