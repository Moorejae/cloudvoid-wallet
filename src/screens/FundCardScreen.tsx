import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function FundCardScreen({ navigation }: any) {
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [onlineTransaction, setOnlineTransaction] = useState(true);
  const [non3DSTransaction, setNon3DSTransaction] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fund Card</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Graphic */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={isCardFrozen ? ['#1e293b', '#334155', '#0f172a'] : ['#2a3b52', '#3f5773', '#1e293b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cardGraphic, isCardFrozen && { opacity: 0.85 }]}
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
              colors={isCardFrozen ? ['#9ca3af', '#6b7280'] : ['#d1d5db', '#9ca3af']}
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
                <View style={[styles.mcCircle, { backgroundColor: isCardFrozen ? '#6b7280' : '#eb001b', left: 10 }]} />
                <View style={[styles.mcCircle, { backgroundColor: isCardFrozen ? '#9ca3af' : '#f79e1b', opacity: 0.8 }]} />
              </View>
            </View>

            {isCardFrozen && (
              <View style={styles.frostOverlay}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.01)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.frozenBadge}>
                  <Ionicons name="snow" size={22} color="#60a5fa" style={styles.glowingSnowflake} />
                  <Text style={styles.frozenBadgeText}>CARD FROZEN</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Action Items */}
        <View style={styles.actionList}>
          
          {/* Top-up Amount */}
          <TouchableOpacity 
            style={[styles.actionItem, isCardFrozen && { opacity: 0.4 }]} 
            onPress={() => navigation.navigate('TopUpUSDT')}
            disabled={isCardFrozen}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="add-circle-outline" size={24} color="#a78bfa" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Top-up Amount</Text>
              <Text style={styles.actionSubtitle}>Top-up flexible amount (1,000 - 50,000 NGN)</Text>
            </View>
          </TouchableOpacity>
 
          {/* Freeze Card */}
          <View style={styles.actionItem}>
            <View style={styles.iconContainer}>
              <Ionicons name={isCardFrozen ? "snow" : "snow-outline"} size={24} color={isCardFrozen ? "#60a5fa" : "#a78bfa"} />
            </View>
            <View style={[styles.actionTextContainer, styles.actionRow]}>
              <Text style={styles.actionTitle}>
                {isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}
              </Text>
              <Switch 
                value={isCardFrozen} 
                onValueChange={setIsCardFrozen}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
 
          {/* Set Limit */}
          <TouchableOpacity 
            style={[styles.actionItem, isCardFrozen && { opacity: 0.4 }]} 
            onPress={() => navigation.navigate('SetLimit')}
            disabled={isCardFrozen}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="calculator-outline" size={24} color="#a78bfa" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                Set Limit <Text style={styles.inlineSubtitle}>(Daily/Weekly)</Text>
              </Text>
            </View>
          </TouchableOpacity>
 
          {/* Terminate Card */}
          <TouchableOpacity 
            style={[styles.actionItem, isCardFrozen && { opacity: 0.4 }]} 
            onPress={() => navigation.navigate('TerminateAccount')}
            disabled={isCardFrozen}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                Terminate Card <Text style={styles.inlineSubtitle}>(Irreversible)</Text>
              </Text>
            </View>
          </TouchableOpacity>
 
          {/* Online Transaction */}
          <View style={[styles.actionItem, isCardFrozen && { opacity: 0.4 }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="globe-outline" size={24} color="#a78bfa" />
            </View>
            <View style={[styles.actionTextContainer, styles.actionRow]}>
              <Text style={styles.actionTitle}>Online Transaction</Text>
              <Switch 
                value={onlineTransaction} 
                onValueChange={setOnlineTransaction}
                trackColor={{ false: '#374151', true: '#8b5cf6' }}
                thumbColor="#ffffff"
                disabled={isCardFrozen}
              />
            </View>
          </View>
 
          {/* Non 3DS Online Transaction */}
          <View style={[styles.actionItem, isCardFrozen && { opacity: 0.4 }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-outline" size={24} color="#a78bfa" />
              <View style={styles.shieldBadge}>
                <Ionicons name="close" size={10} color={CloudVoidTheme.colors.backBtn} />
              </View>
            </View>
            <View style={[styles.actionTextContainer, styles.actionRow]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.actionTitle}>Non 3DS Online Transaction</Text>
                <Text style={styles.actionSubtitle}>Requires Advanced Security for use</Text>
              </View>
              <Switch 
                value={non3DSTransaction} 
                onValueChange={setNon3DSTransaction}
                trackColor={{ false: '#374151', true: '#8b5cf6' }}
                thumbColor="#ffffff"
                disabled={isCardFrozen}
              />
            </View>
          </View>

        </View>
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    width: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginBottom: 30,
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
  actionList: {
    width: '100%',
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shieldBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 15,
    fontWeight: '500',
  },
  inlineSubtitle: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  actionSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  frostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  frozenBadgeText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  glowingSnowflake: {
    textShadowColor: 'rgba(96, 165, 250, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
