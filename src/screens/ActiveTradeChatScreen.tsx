import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';

export default function ActiveTradeChatScreen({ navigation, route }: any) {
  const { readOnly = false, anonymize = false } = route?.params || {};
  const [inputText, setInputText] = useState('');
  const [isDisputed, setIsDisputed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('initial'); // initial | sent | released
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI', text: 'Trade matched! You are buying 36.23 USDT for ₦50,000 from Ayofemi.', time: '10:00 AM' },
    { id: 2, sender: 'AI', text: 'Payment Details:\nBank: OPay\nAccount: 9012345678\nName: Ayofemi John', time: '10:00 AM' },
    { id: 3, sender: 'Merchant', text: 'Hello, I am online. Please proceed with the payment. Send receipt once done.', time: '10:01 AM' },
  ]);

  const glowAnim = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: 'User',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleSentMoney = () => {
    setPaymentStatus('sent');
    setMessages([...messages, {
      id: Date.now(),
      sender: 'System',
      text: 'You marked the payment as sent. Awaiting merchant to release assets.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Simulate merchant releasing funds after 3 seconds for demonstration
    setTimeout(() => {
      setPaymentStatus('released');
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'AI',
        text: 'Ayofemi has released 36.23 USDT to your wallet. Trade Complete!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 3000);
  };

  const toggleDispute = () => {
    setIsDisputed(!isDisputed);
    setShowMenu(false);
    
    setMessages([...messages, {
      id: Date.now(),
      sender: 'System',
      text: !isDisputed ? 'Trade has been disputed. Admin has been notified.' : 'Dispute has been resolved manually.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleCancelTrade = () => {
    setShowMenu(false);
    setPaymentStatus('cancelled');
    setMessages([...messages, {
      id: Date.now(),
      sender: 'System',
      text: 'You have cancelled the trade.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{anonymize ? 'Anonymous' : 'Ayofemi'}</Text>
          <Text style={styles.statusText}>🟢 Online</Text>
        </View>

        {!readOnly ? (
          <TouchableOpacity style={styles.headerBtnRight} onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color={CloudVoidTheme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtnRight} />
        )}
      </View>

      {/* Trade Info Banner */}
      {isDisputed && (
        <View style={styles.disputeBanner}>
          <Ionicons name="warning-outline" size={20} color={CloudVoidTheme.colors.textPrimary} />
          <Text style={styles.disputeBannerText}>This trade is currently under dispute.</Text>
        </View>
      )}

      {/* Chat Area */}
      <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => {
          let displayedText = msg.text;
          if (anonymize) {
            displayedText = displayedText.replace(/Ayofemi John/g, '████████').replace(/Ayofemi/g, '██████');
          }
          
          if (msg.sender === 'AI' || msg.sender === 'System') {
            return (
              <View key={msg.id} style={styles.systemMessageContainer}>
                <View style={[styles.systemMessageBubble, msg.sender === 'System' && { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                  {msg.sender === 'AI' && <Ionicons name="sparkles" size={14} color="#c084fc" style={{marginRight: 6}} />}
                  {msg.sender === 'System' && <Ionicons name="information-circle" size={14} color="#22c55e" style={{marginRight: 6}} />}
                  <Text style={[styles.systemMessageText, msg.sender === 'System' && { color: '#22c55e' }]}>{displayedText}</Text>
                </View>
                <Text style={styles.timeTextCenter}>{msg.time}</Text>
              </View>
            );
          }

          const isUser = msg.sender === 'User';
          return (
            <View key={msg.id} style={[styles.messageRow, isUser ? styles.messageRowRight : styles.messageRowLeft]}>
              {!isUser && (
                <View style={styles.merchantAvatar}>
                  <Text style={styles.merchantAvatarText}>{anonymize ? 'A' : 'A'}</Text>
                </View>
              )}
              <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.merchantBubble]}>
                <Text style={styles.messageText}>{displayedText}</Text>
                <Text style={styles.timeText}>{msg.time}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Corner Action Button (Glowing Sent) */}
      {paymentStatus === 'initial' && !isDisputed && !readOnly && (
        <View style={styles.actionPromptContainer}>
          <TouchableOpacity onPress={handleSentMoney} activeOpacity={0.8}>
            <Animated.View style={[styles.paidBtn, { opacity: glowAnim }]}>
              <Ionicons name="checkmark-circle" size={18} color={CloudVoidTheme.colors.textPrimary} style={{marginRight: 6}} />
              <Text style={styles.paidBtnText}>Sent</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      {/* Gemini-Style Bottom Input Bar */}
      {!readOnly && (
        <View style={styles.bottomInputContainer}>
          <TouchableOpacity style={styles.plusBtn}>
            <Ionicons name="add" size={24} color={CloudVoidTheme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.textInput}
              placeholder="Write a message..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              {inputText.length > 0 ? (
                <Ionicons name="send" size={20} color="#8b5cf6" />
              ) : (
                <Ionicons name="mic-outline" size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* More Options Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={toggleDispute}>
              <Ionicons name={isDisputed ? "checkmark-circle-outline" : "warning-outline"} size={20} color={isDisputed ? "#22c55e" : "#ef4444"} />
              <Text style={[styles.menuItemText, { color: isDisputed ? '#22c55e' : '#ef4444' }]}>
                {isDisputed ? 'Resolve Dispute' : 'Dispute Trade'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleCancelTrade}>
              <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Cancel Trade</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1c1c24',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 16,
    fontWeight: '700',
  },
  statusText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  headerBtnRight: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  disputeBanner: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeBannerText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 80, // Extra padding for the floating button
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  systemMessageBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  systemMessageText: {
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  timeTextCenter: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 6,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  merchantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  merchantAvatarText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  merchantBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  actionPromptContainer: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    zIndex: 10,
  },
  paidBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  paidBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30, // Safe area for newer iPhones
    backgroundColor: '#1c1c24',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
  },
  textInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
  },
  sendBtn: {
    paddingLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
});
