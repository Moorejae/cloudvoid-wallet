import React, { useState } from 'react';
import { CloudVoidTheme } from '../theme/tokens';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LiquidityPricingSetupScreen({ navigation }: any) {
  const [releaseTime, setReleaseTime] = useState('15m');

  const RELEASE_TIMES = ['10m', '15m', '20m', '30m', '60m'];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Liquidity & Pricing Setup
        </Text>
        <View style={styles.headerBtnRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Manual Configuration */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, {marginBottom: 8}]}>Fixed Buy Rate</Text>
          <View style={styles.inputRow}>
            <TextInput 
              style={{color: CloudVoidTheme.colors.textPrimary, fontSize: 14, flex: 1, padding: 0}} 
              defaultValue="1385.50" 
              keyboardType="numeric" 
            />
            <Text style={styles.inputSuffix}>NGN</Text>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, {marginBottom: 8}]}>Fixed Sell Rate</Text>
          <View style={styles.inputRow}>
            <TextInput 
              style={{color: CloudVoidTheme.colors.textPrimary, fontSize: 14, flex: 1, padding: 0}} 
              defaultValue="1390.00" 
              keyboardType="numeric" 
            />
            <Text style={styles.inputSuffix}>NGN</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternative API Providers</Text>
          <TextInput style={styles.textInput} placeholder="Provider Name (e.g., Binance P2P)" placeholderTextColor="#6b7280" />
          <TextInput style={styles.textInput} placeholder="API Endpoint URL" placeholderTextColor="#6b7280" />
          <TextInput style={styles.textInput} placeholder="API Key (Optional)" placeholderTextColor="#6b7280" />
          <TextInput style={styles.textInput} placeholder="API Secret (Optional)" placeholderTextColor="#6b7280" secureTextEntry />
        </View>

        {/* Release Time & Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Release Time & Limits</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack} />
            <View style={styles.sliderMarks}>
              {RELEASE_TIMES.map((time, idx) => {
                const isActive = time === releaseTime;
                return (
                  <TouchableOpacity key={idx} style={styles.sliderMarkWrapper} onPress={() => setReleaseTime(time)}>
                    <View style={[styles.sliderMarkDot, isActive && styles.sliderMarkDotActive]} />
                    <Text style={[styles.sliderMarkText, isActive && styles.sliderMarkTextActive]}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Order Limits</Text>
          <TextInput style={styles.textInput} placeholder="Min P2P Order Limit (NGN)" placeholderTextColor="#6b7280" keyboardType="numeric" />
          <TextInput style={styles.textInput} placeholder="Max P2P Order Limit (NGN)" placeholderTextColor="#6b7280" keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnText}>
            Save Configuration
          </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerBtn: {
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
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerBtnRight: {
    width: 80,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  subSectionTitle: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  toggleBtnText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: CloudVoidTheme.colors.textPrimary,
  },
  autoSubText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputRowReadonly: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputLabel: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  inputSuffix: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputSuffixReadonly: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  sliderContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    position: 'absolute',
    top: 6,
    left: 20,
    right: 20,
  },
  sliderMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderMarkWrapper: {
    alignItems: 'center',
    width: 40,
  },
  sliderMarkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#12121a',
  },
  sliderMarkDotActive: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
  },
  sliderMarkText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  sliderMarkTextActive: {
    color: '#c4b5fd',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 15,
    fontWeight: '700',
  },
  spacer: {
    height: 40,
  },
});
