import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

export default function VirtualCardScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={24} color={CloudVoidTheme.colors.backBtn} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Debit Card</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Card & Balance Container */}
        <View style={styles.cardWrapper}>
          
          {/* Physical Card Graphic */}
          <LinearGradient
            colors={['#2a3b52', '#3f5773', '#1e293b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGraphic}
          >
            {/* Top Row: Brand & Type */}
            <View style={styles.cardTopRow}>
              <Text style={styles.brandText}>
                <Text style={{ fontWeight: '800' }}>CLOUD</Text>VOID
              </Text>
              
              <View style={styles.cardTypeContainer}>
                <Ionicons name="cloud-outline" size={24} color={CloudVoidTheme.colors.textPrimary} />
                <Text style={styles.cardTypeText}>DEBIT</Text>
              </View>
            </View>

            {/* Chip */}
            <LinearGradient
              colors={['#d1d5db', '#9ca3af']}
              style={styles.chip}
            >
              <View style={styles.chipLine1} />
              <View style={styles.chipLine2} />
              <View style={styles.chipLine3} />
            </LinearGradient>

            {/* Card Number */}
            <Text style={styles.cardNumber}>****  ****  1234</Text>

            {/* Bottom Row: Details & Network */}
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardExpiry}>08/28</Text>
                <Text style={styles.cardHolder}>M. Thompson</Text>
              </View>
              
              {/* Mastercard Logo Mock */}
              <View style={styles.mastercardLogo}>
                <View style={[styles.mcCircle, { backgroundColor: '#eb001b', left: 10 }]} />
                <View style={[styles.mcCircle, { backgroundColor: '#f79e1b', opacity: 0.8 }]} />
              </View>
            </View>
          </LinearGradient>

          {/* Current Balance attached to bottom */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>$1,245.88 USD</Text>
          </View>
        </View>

      </View>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('FundCard')}>
          <Text style={styles.actionBtnText}>Add Funds</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CardInfo')}>
          <Text style={styles.actionBtnText}>View Card Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Very dark slate to match background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40, // For modal notch / safe area
    marginBottom: 30,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  cardGraphic: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    letterSpacing: 1,
  },
  cardTypeContainer: {
    alignItems: 'center',
  },
  cardTypeText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    justifyContent: 'space-evenly',
    paddingVertical: 4,
  },
  chipLine1: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  chipLine2: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  chipLine3: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  cardNumber: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardExpiry: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 12,
    marginBottom: 4,
  },
  cardHolder: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 48,
    height: 30,
    justifyContent: 'center',
  },
  mcCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
  },
  balanceContainer: {
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: -10, // Slight overlap/flush fit with card graphic
    zIndex: -1,     // Ensure it stays behind the card curve
  },
  balanceLabel: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  balanceValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#4c1d95',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
