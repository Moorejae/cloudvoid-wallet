import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import DoubleConfirmModal from '../components/DoubleConfirmModal';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

export default function OrderActiveScreen({ route, navigation }: any) {
  const { orderId = 'ord_default', merchantName = 'AlphaBroker', amount = 100, fiatAmount = 150000, rate = 1500, paymentMethod = 'Bank Transfer' } = route.params || {};

  const userId = useWalletStore((state) => state.userId) || '0xUserAddress';
  const riskScore = useWalletStore((state) => state.riskScore);
  const setRiskScore = useWalletStore((state) => state.setRiskScore);

  const [status, setStatus] = useState<'matched' | 'escrow_committed' | 'fiat_sent' | 'disputed' | 'settled' | 'cancelled'>('matched');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [disputeTimer, setDisputeTimer] = useState<number | null>(null);
  
  // Double confirm modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const chatScrollRef = useRef<ScrollView | null>(null);

  // 1. WebSocket chat connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/p2p/${orderId}?user_id=${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'chat') {
        setMessages((prev) => [...prev, {
          sender: payload.sender,
          text: payload.text,
          timestamp: payload.timestamp
        }]);
      } else if (payload.type === 'telemetry' && payload.user_id === userId) {
        setRiskScore(payload.risk_score);
      }
    };

    // Await real connection for history
    setMessages([]);

    return () => ws.close();
  }, [orderId]);

  // 2. Dispute cooldown countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (disputeTimer !== null && disputeTimer > 0) {
      interval = setInterval(() => {
        setDisputeTimer((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (disputeTimer === 0) {
      setDisputeTimer(null);
    }
    return () => clearInterval(interval);
  }, [disputeTimer]);

  const handleSendMessage = async (text: string, isPaste = false) => {
    if (!text.trim()) return;

    if (isPaste) {
      // Telemetry trigger: increment risk score by 10 points
      setRiskScore(Math.min(100, riskScore + 10));
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        sender: userId,
        text: text.trim(),
        is_paste: isPaste
      }));
    } else {
      // Offline fallback simulator
      setMessages((prev) => [...prev, {
        sender: userId,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Lexical check mock
      if (text.includes('@') || text.toLowerCase().includes('telegram') || text.toLowerCase().includes('whatsapp')) {
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            sender: 'system',
            text: '[SYSTEM WARNING: OFF-PLATFORM CONTACT INFORMATION DETECTED AND BLOCKED TO PREVENT FRAUD]',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }, 600);
      }
    }
    setChatInput('');
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Clipboard Paste listener
  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setChatInput(text);
      handleSendMessage(text, true);
    }
  };

  // API State change Triggers
  const handleCommitEscrow = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/p2p/escrow-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      if (res.ok) {
        setStatus('escrow_committed');
        setMessages((prev) => [...prev, {
          sender: 'system',
          text: 'MoveVM Escrow Committed! Assets secured. Gas sponsored by paymaster node.',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (e) {
      setStatus('escrow_committed');
    }
  };

  const handleFiatSent = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/p2p/fiat-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, user_id: userId })
      });
      if (res.ok) {
        setStatus('fiat_sent');
        setDisputeTimer(300); // 5 minutes lock
        setMessages((prev) => [...prev, {
          sender: 'system',
          text: 'Buyer marked funds as sent. Seller must verify statements. Dispute lock active for 5m.',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (e) {
      setStatus('fiat_sent');
      setDisputeTimer(300);
    }
  };

  const handleReleaseEscrow = () => {
    setIsReleaseModalOpen(true);
  };

  const handleConfirmRelease = async () => {
    setIsReleaseModalOpen(false);
    try {
      const res = await fetch('http://localhost:8000/api/p2p/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, user_id: userId })
      });
      if (res.ok) {
        setStatus('settled');
        Alert.alert('Trade Settled', 'USDT released from escrow. Platform tax of $0.50 assessed.');
        navigation.popToTop();
      }
    } catch (e) {
      setStatus('settled');
      Alert.alert('Trade Settled', 'USDT released from escrow. Platform tax of $0.50 assessed.');
      navigation.popToTop();
    }
  };

  const handleCancelOrder = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelModalOpen(false);
    setStatus('cancelled');
    Alert.alert('Order Cancelled', 'Escrow returned to merchant.');
    navigation.popToTop();
  };

  const handleInitiateDispute = async () => {
    if (disputeTimer !== null) {
      Alert.alert('Dispute Locked', `Please wait ${disputeTimer}s for bank networks to settle.`);
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/p2p/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, user_id: userId })
      });
      if (res.ok) {
        setStatus('disputed');
        Alert.alert('Dispute Initiated', 'PostgreSQL rows locked. Routing to Jury room.');
        navigation.replace('Dispute', { orderId });
      }
    } catch (e) {
      setStatus('disputed');
      navigation.replace('Dispute', { orderId });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back-outline" size={24} color={CloudVoidTheme.colors.backBtn} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Matched Order</Text>
          <TouchableOpacity onPress={handleInitiateDispute} style={styles.disputeBtn}>
            <Text style={styles.disputeBtnText}>Dispute</Text>
          </TouchableOpacity>
        </View>

        {/* Order Details info bar */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailTitle}>{merchantName}</Text>
            <Text style={styles.statusBadge}>{status.toUpperCase().replace('_', ' ')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailGrid}>
            <View>
              <Text style={styles.gridLabel}>Amount (Escrow)</Text>
              <Text style={styles.gridVal}>{amount.toFixed(2)} USDT</Text>
            </View>
            <View>
              <Text style={styles.gridLabel}>To Send / Receive</Text>
              <Text style={styles.gridVal}>₦{fiatAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Bank details instruction card */}
        <View style={styles.bankCard}>
          <Text style={styles.bankLabel}>Seller Banking Instructions</Text>
          <Text style={styles.bankText}>Bank: Access Bank</Text>
          <Text style={styles.bankText}>Name: {merchantName} Global</Text>
          <Text style={styles.bankText}>Account: 0112233445</Text>
        </View>

        {/* Chat window */}
        <ScrollView 
          ref={chatScrollRef} 
          style={styles.chatArea}
          contentContainerStyle={{ paddingVertical: 12 }}
        >
          {messages.map((msg, idx) => {
            const isSystem = msg.sender === 'system';
            const isMe = msg.sender === userId;
            return (
              <View 
                key={idx} 
                style={[
                  styles.msgRow,
                  isSystem ? styles.sysRow : isMe ? styles.myRow : styles.otherRow
                ]}
              >
                <View 
                  style={[
                    styles.chatBubble,
                    isSystem ? styles.sysBubble : isMe ? styles.myBubble : styles.otherBubble
                  ]}
                >
                  <Text style={[styles.msgText, isSystem ? styles.sysText : null]}>{msg.text}</Text>
                </View>
                <Text style={styles.msgTime}>{msg.timestamp}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Chat input footer */}
        <View style={styles.chatFooter}>
          <TouchableOpacity onPress={handlePaste} style={styles.clipboardBtn}>
            <Ionicons name="clipboard-outline" size={20} color={CloudVoidTheme.colors.textPrimary} />
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your message..."
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={() => handleSendMessage(chatInput)}
          />
          <TouchableOpacity onPress={() => handleSendMessage(chatInput)} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color={CloudVoidTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Active workflows actions */}
        <View style={styles.actionsBar}>
          {status === 'matched' && (
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleCommitEscrow}>
              <Text style={styles.actionBtnText}>Escrow Commit</Text>
            </TouchableOpacity>
          )}

          {status === 'escrow_committed' && (
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleCancelOrder}>
                <Text style={styles.actionBtnTextSec}>Cancel Order</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleFiatSent}>
                <Text style={styles.actionBtnText}>Mark Paid (Fiat Sent)</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'fiat_sent' && (
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleReleaseEscrow}>
              <Text style={styles.actionBtnText}>Release Escrow Assets</Text>
            </TouchableOpacity>
          )}

          {status === 'settled' && (
            <Text style={styles.settledLabel}>🎉 Trade settled. Funds successfully distributed.</Text>
          )}
        </View>

        {/* Confirmation modals */}
        <DoubleConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          title="Cancel Trade Order"
          message="You are about to cancel this order. If you have already sent bank funds, your escrow will be lost."
        />

        <DoubleConfirmModal
          isOpen={isReleaseModalOpen}
          onClose={() => setIsReleaseModalOpen(false)}
          onConfirm={handleConfirmRelease}
          title="Release Escrow Tokens"
          message="Ensure you have fully received Naira bank funds before releasing. This cannot be undone."
          confirmBg={CloudVoidTheme.colors.success}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 18,
    fontWeight: '700',
  },
  disputeBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  disputeBtnText: {
    color: CloudVoidTheme.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: CloudVoidTheme.colors.accentGlow,
    backgroundColor: 'rgba(139,92,246,0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: CloudVoidTheme.colors.border,
    marginVertical: 10,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridLabel: {
    fontSize: 11,
    color: CloudVoidTheme.colors.textSecondary,
    marginBottom: 4,
  },
  gridVal: {
    fontSize: 15,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
  },
  bankCard: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bankLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: CloudVoidTheme.colors.warning,
    marginBottom: 6,
  },
  bankText: {
    fontSize: 13,
    color: CloudVoidTheme.colors.textSecondary,
    lineHeight: 18,
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
  },
  msgRow: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  sysRow: {
    alignSelf: 'center',
    maxWidth: '90%',
  },
  myRow: {
    alignSelf: 'flex-end',
  },
  otherRow: {
    alignSelf: 'flex-start',
  },
  chatBubble: {
    padding: 12,
    borderRadius: 12,
  },
  sysBubble: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  myBubble: {
    backgroundColor: CloudVoidTheme.colors.accent,
  },
  otherBubble: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  msgText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  sysText: {
    color: CloudVoidTheme.colors.warning,
    fontSize: 12,
    textAlign: 'center',
  },
  msgTime: {
    fontSize: 9,
    color: CloudVoidTheme.colors.textDisabled,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CloudVoidTheme.colors.surface,
    paddingHorizontal: 12,
    height: 52,
    borderTopWidth: 1,
    borderTopColor: CloudVoidTheme.colors.border,
  },
  clipboardBtn: {
    padding: 6,
  },
  chatInput: {
    flex: 1,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    marginLeft: 12,
    height: '100%',
  },
  sendBtn: {
    padding: 6,
  },
  actionsBar: {
    padding: 16,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: CloudVoidTheme.colors.border,
  },
  actionBtnPrimary: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  actionBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  actionBtnTextSec: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  settledLabel: {
    color: CloudVoidTheme.colors.success,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
