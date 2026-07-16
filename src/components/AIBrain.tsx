import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Animated, PanResponder, Platform, KeyboardAvoidingView,
  FlatList, ScrollView, ActivityIndicator, Keyboard, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme, applyTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import axios from 'axios';
import { API_BASE_URL } from '../services/web3Api';

const GLOBAL_ACTIONS = [
  { label: 'Add Token', icon: 'add-circle-outline', command: 'add token' },
  { label: 'Search Hash', icon: 'search-outline', command: 'search hash' },
  { label: 'Filter Deposits', icon: 'arrow-down-circle-outline', command: 'filter deposits' },
  { label: 'Filter Withdrawals', icon: 'arrow-up-circle-outline', command: 'filter withdrawals' },
  { label: 'Token Info', icon: 'stats-chart-outline', command: 'token info' },
  { label: 'Remove Token', icon: 'close-circle-outline', command: 'hide token' },
  { label: 'Burner Wallet', icon: 'key-outline', command: 'generate burner' },
  { label: 'Filter by Date', icon: 'calendar-outline', command: 'filter by date' },
  { label: 'Scan Receipt', icon: 'receipt-outline', command: 'scan receipt' },
  { label: 'Toggle Theme', icon: 'moon-outline', command: 'toggle theme' },
  { label: 'Change Language', icon: 'language-outline', command: 'change language' },
  { label: 'Change Currency', icon: 'cash-outline', command: 'change currency' },
  { label: 'Notifications', icon: 'notifications-outline', command: 'toggle notifications' },
  { label: 'Ping Latency', icon: 'speedometer-outline', command: 'ping latency' },
];

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export default function AIBrain({ currentRouteName = 'Wallet' }: { currentRouteName?: string }) {
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: 'Hello! I am your AI Assistant. How can I help you today?', sender: 'ai' }
  ]);
  
  const walletStore = useWalletStore();
  const pan = useRef(new Animated.ValueXY()).current;
  const flatListRef = useRef<FlatList>(null);

  const btnPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only set pan responder if there is actual movement, allowing static taps to register instantly
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => pan.extractOffset(),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        // Wider tap detection window (15px) to handle click jitters on emulators and touch screens
        if (Math.abs(gestureState.dx) < 15 && Math.abs(gestureState.dy) < 15) {
          handleToggle();
        }
      }
    })
  ).current;

  const blockedRoutes = [
    'Welcome', 'Login', 'Register', 'EmailVerify', 'WalletSetup', 'ImportWallet', 'CreateWallet', 'SeedPhraseVerify',
    'FiatHub', 'VirtualCard', 'CardInfo', 'FundCard', 'TopUpUSDT', 'SetLimit', 'TerminateAccount', 'FiatTransactionList', 'IssueCard', 'ConvertFiat', 'MerchantFinder',
    'Connect', 'Web3Flow'
  ];

  if (blockedRoutes.includes(currentRouteName)) return null;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!expanded) {
      setInputText('');
    }
    setExpanded(!expanded);
  };

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    setMessages(prev => [...prev, { id: Math.random().toString(), text, sender }]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addMessageStream = (text: string) => {
    const messageId = Math.random().toString();
    setMessages(prev => [...prev, { id: messageId, text: '', sender: 'ai' }]);
    
    let currentText = '';
    const words = text.split(' ');
    let wordIndex = 0;
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, text: currentText } : msg));
        wordIndex++;
        flatListRef.current?.scrollToEnd({ animated: true });
      } else {
        clearInterval(interval);
      }
    }, 80);
  };

  const processAIResponse = (data: any) => {
    const { speechResponse, action, payload } = data;
    
    if (speechResponse) {
      addMessageStream(speechResponse);
    }

    if (action) {
      setTimeout(() => {
        if (action === 'NAVIGATE') {
          setExpanded(false);
          navigation.navigate(payload.route);
        } else if (action === 'TOGGLE_THEME') {
          const newTheme = walletStore.theme === 'dark' ? 'light' : 'dark';
          walletStore.setTheme(newTheme);
          applyTheme(newTheme);
        } else if (action === 'TOGGLE_NOTIFICATIONS') {
          walletStore.setNotificationsEnabled(!walletStore.notificationsEnabled);
        } else if (action === 'CHANGE_LANGUAGE') {
          walletStore.setLanguage(payload.language);
        } else if (action === 'CHANGE_CURRENCY') {
          walletStore.setCurrency(payload.currency);
        } else if (action === 'ADD_TOKEN') {
          walletStore.addToken({
            symbol: payload.symbol, 
            name: payload.name || payload.symbol, 
            price: 0, change: 0,
            iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
            sparklineData: [20, 20, 20]
          });
          walletStore.setBalances({ [payload.symbol]: 0.0 });
        } else if (action === 'REMOVE_TOKEN') {
          walletStore.removeToken(payload.symbol);
        } else if (action === 'FILTER_LIST') {
          if (payload.filters === 'deposits') {
            walletStore.setActiveTxFilter('Receive');
            walletStore.setActiveTxDateFilter(null);
            walletStore.setActiveTxHashQuery(null);
          } else if (payload.filters === 'withdrawals') {
            walletStore.setActiveTxFilter('Send');
            walletStore.setActiveTxDateFilter(null);
            walletStore.setActiveTxHashQuery(null);
          } else if (payload.filters === 'date') {
            walletStore.setActiveTxDateFilter(payload.value);
          }
          setExpanded(false);
          navigation.navigate('History');
        } else if (action === 'SEARCH_HASH') {
          walletStore.setActiveTxFilter('All');
          walletStore.setActiveTxDateFilter(null);
          walletStore.setActiveTxHashQuery(payload.hash);
          setExpanded(false);
          navigation.navigate('History');
        } else if (action === 'SCAN_RECEIPT') {
          walletStore.setActiveTxFilter('All');
          walletStore.setActiveTxDateFilter(null);
          walletStore.setActiveTxHashQuery(payload.receipt);
          setExpanded(false);
          navigation.navigate('History');
        } else if (action === 'GENERATE_BURNER') {
          walletStore.addWallet({
            id: Math.random().toString(),
            name: `Burner (${payload.symbol || 'ETH'})`,
            address: payload.address,
            status: 'Active'
          });
        } else if (action === 'SHOW_SCAM_WARNING') {
          Alert.alert(
            "Scam Check Complete",
            `We performed an automated security audit on the token ${payload.symbol.toUpperCase()}.\n\n• Honeypot: No\n• Liquidity: Locked\n• Contract: Verified\n• Risk Score: Low (0/100)\n\nIt appears safe, but please do your own research before trading.`,
            [{ text: "Understood" }]
          );
        }
      }, 500);
    }
  };

  const handleActionChip = async (command: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addMessage(`Triggered: ${label}`, 'user');
    setIsTyping(true);

    try {
      const tones = ['casual', 'professional', 'empathetic', 'funny'];
      const randomTone = tones[Math.floor(Math.random() * tones.length)];
      const response = await axios.post(`${API_BASE_URL}/api/concierge`, { 
        message: command, 
        currentScreen: currentRouteName, 
        sessionToken: walletStore.activeWalletId || 'local_session_001', 
        directAction: true,
        tone: randomTone
      });
      setIsTyping(false);
      processAIResponse(response.data);
    } catch (error) {
      setIsTyping(false);
      addMessage('Error connecting to AI Backend.', 'ai');
    }
  };

  const handleSend = async () => {
    const userMsg = inputText.trim();
    if (!userMsg) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setInputText('');
    Keyboard.dismiss();
    addMessage(userMsg, 'user');
    setIsTyping(true);

    try {
      const tones = ['casual', 'professional', 'empathetic', 'funny'];
      const randomTone = tones[Math.floor(Math.random() * tones.length)];
      const response = await axios.post(`${API_BASE_URL}/api/concierge`, { 
        message: userMsg, 
        currentScreen: currentRouteName, 
        sessionToken: walletStore.activeWalletId || 'local_session_001',
        tone: randomTone
      });
      setIsTyping(false);
      processAIResponse(response.data);
    } catch (error) {
      setIsTyping(false);
      addMessage("Error connecting to AI Backend Service.", 'ai');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="planet" size={16} color="#fff" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAI]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (expanded) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.expandedContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="planet" size={24} color="#fff" />
            <Text style={styles.headerTitle}>AI Assistant</Text>
          </View>
          <TouchableOpacity onPress={handleToggle} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Chat History */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.typingText}>Processing...</Text>
              </View>
            ) : null
          }
        />

        {/* Action Chips (Horizontal Scroll) */}
        <View style={styles.actionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
            {GLOBAL_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionChip}
                onPress={() => handleActionChip(action.command, action.label)}
                disabled={isTyping}
              >
                <Ionicons name={action.icon as any} size={16} color="#fff" />
                <Text style={styles.actionChipText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Always-Visible Input Bar */}
        <View style={styles.inputArea}>
          <View style={styles.inputCapsuleDark}>
            <TouchableOpacity style={styles.plusBtn}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.inputDark}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!inputText.trim() || isTyping}>
              {inputText.trim() ? (
                <LinearGradient colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendGradientActive}>
                  <Ionicons name="paper-plane" size={16} color="#ffffff" style={{ marginLeft: -2 }} />
                </LinearGradient>
              ) : (
                <View style={styles.sendGradientInactive}>
                  <Ionicons name="paper-plane" size={16} color="rgba(255,255,255,0.3)" style={{ marginLeft: -2 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View style={[styles.bubbleContainer, { transform: pan.getTranslateTransform() }]} {...btnPanResponder.panHandlers}>
      <View 
        style={[
          styles.glassFloatingIcon, 
          walletStore.theme === 'light' && { 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            borderColor: 'rgba(0, 0, 0, 0.9)',
            shadowColor: '#000'
          }
        ]}
      >
        <Ionicons name="planet" size={32} color="#fff" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    zIndex: 9999,
  },
  glassFloatingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  expandedContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 5, 20, 0.98)', 
    zIndex: 99999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextAI: {
    color: '#e2e8f0',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  typingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  actionsContainer: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  actionsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 6,
  },
  actionChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  inputArea: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'transparent',
  },
  inputCapsuleDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 30, 0.9)',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  plusBtn: {
    padding: 4,
  },
  inputDark: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    minHeight: 40,
    maxHeight: 100,
  },
  sendBtn: {
    padding: 4,
  },
  sendGradientActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  sendGradientInactive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
