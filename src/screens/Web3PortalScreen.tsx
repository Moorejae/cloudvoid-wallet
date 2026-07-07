import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { useWalletConnectStore } from '../stores/walletConnectStore';

import Svg, { Path, Circle } from 'react-native-svg';

export default function Web3PortalScreen() {
  const [activeTab, setActiveTab] = useState('Wallet');
  const navigation = useNavigation<any>();
  const sessions = useWalletConnectStore(state => state.sessions);
  const disconnectSession = useWalletConnectStore(state => state.disconnectSession);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="5" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5"/>
            <Path d="M12 7C14.2091 7 16 9.23858 16 12C16 14.7614 14.2091 17 12 17C9.79086 17 8 14.7614 8 12C8 9.23858 9.79086 7 12 7Z" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
            <Path d="M7 12H17" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1.5" />
            <Circle cx="12" cy="12" r="9" stroke={CloudVoidTheme.colors.accentGlow} strokeWidth="1" strokeDasharray="2 4" />
          </Svg>
        </View>
        <TouchableOpacity style={styles.wcButton} onPress={() => navigation.navigate('WalletConnectScanner')}>
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Path d="M5.5 9.5C9.08985 5.91015 14.9101 5.91015 18.5 9.5L20.25 11.25L17.5 14L15.75 12.25C13.6789 10.1789 10.3211 10.1789 8.25 12.25L6.5 14L3.75 11.25L5.5 9.5Z" fill="#3B99FC"/>
            <Path d="M11 17L12 18L15.5 14.5L14.5 13.5L11 17Z" fill="#3B99FC"/>
            <Path d="M13 17L12 18L8.5 14.5L9.5 13.5L13 17Z" fill="#3B99FC"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Wallet' && styles.activeTab]}
          onPress={() => setActiveTab('Wallet')}
        >
          <Text style={[styles.tabText, activeTab === 'Wallet' && styles.activeTabText]}>Wallet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 150 }}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Active Sessions</Text>
            <Text style={styles.emptyDesc}>
              Tap the WalletConnect icon in the top right corner to connect CloudVoid to Web3 dApps.
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {sessions.map((session) => (
              <View key={session.topic} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionName}>{session.peerMeta.name}</Text>
                  <TouchableOpacity onPress={() => disconnectSession(session.topic)}>
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.sessionUrl}>{session.peerMeta.url}</Text>
                <Text style={styles.sessionTopic}>Topic: {session.topic}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wcButton: {
    padding: 8,
    backgroundColor: 'rgba(59, 153, 252, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 153, 252, 0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: CloudVoidTheme.colors.primary,
  },
  tabText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyDesc: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  sessionsList: {
    paddingTop: 16,
  },
  sessionCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disconnectText: {
    color: CloudVoidTheme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  sessionUrl: {
    color: CloudVoidTheme.colors.primary,
    fontSize: 14,
    marginBottom: 12,
  },
  sessionTopic: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 12,
  },
});
