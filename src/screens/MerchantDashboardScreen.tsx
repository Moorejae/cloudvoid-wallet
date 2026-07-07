import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';

export default function MerchantDashboardScreen({ navigation }: any) {
  const trustPoints = useWalletStore((state) => state.trustPoints);

  const [showSettings, setShowSettings] = useState(false);
  const [alias, setAlias] = useState('TrustedTradePro');
  const [tempAlias, setTempAlias] = useState(alias);
  const [avatarSource, setAvatarSource] = useState<any>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);

  const AVATAR_OPTIONS = [
    require('../../assets/avatars/Gemini_Generated_Image_1pu0vj1pu0vj1pu0.png'),
    require('../../assets/avatars/Gemini_Generated_Image_3lpivw3lpivw3lpi.png'),
    require('../../assets/avatars/Gemini_Generated_Image_a7ec02a7ec02a7ec.png'),
    require('../../assets/avatars/Gemini_Generated_Image_bt2w67bt2w67bt2w.png'),
    require('../../assets/avatars/Gemini_Generated_Image_c2tg8fc2tg8fc2tg.png'),
    require('../../assets/avatars/Gemini_Generated_Image_cs3r7vcs3r7vcs3r.png'),
    require('../../assets/avatars/Gemini_Generated_Image_d4mwgqd4mwgqd4mw.png'),
    require('../../assets/avatars/Gemini_Generated_Image_emzl2kemzl2kemzl.png'),
    require('../../assets/avatars/Gemini_Generated_Image_hx74zzhx74zzhx74.png'),
    require('../../assets/avatars/Gemini_Generated_Image_k34hudk34hudk34h.png'),
    require('../../assets/avatars/Gemini_Generated_Image_ktmivmktmivmktmi.png'),
    require('../../assets/avatars/Gemini_Generated_Image_l80smjl80smjl80s.png'),
    require('../../assets/avatars/Gemini_Generated_Image_lf8lmtlf8lmtlf8l.png'),
    require('../../assets/avatars/Gemini_Generated_Image_mpqk4wmpqk4wmpqk.png'),
    require('../../assets/avatars/Gemini_Generated_Image_n2f7u0n2f7u0n2f7.png'),
    require('../../assets/avatars/Gemini_Generated_Image_oh05isoh05isoh05.png'),
    require('../../assets/avatars/Gemini_Generated_Image_qw80zmqw80zmqw80.png'),
    require('../../assets/avatars/Gemini_Generated_Image_v4g1kev4g1kev4g1.png'),
    require('../../assets/avatars/Gemini_Generated_Image_yobvpwyobvpwyobv.png')
  ];

  const handleSaveSettings = () => {
    setAlias(tempAlias);
    setShowSettings(false);
  };

  const handleUploadAvatar = () => {
    setShowImagePicker(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.backBtn} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Dashboard</Text>
        <TouchableOpacity style={styles.headerBtnRight} onPress={() => { setTempAlias(alias); setShowSettings(true); }}>
          <Ionicons name="settings-outline" size={20} color="#a78bfa" />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Merchant Details Card */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrapper}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatarCircle} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={32} color={CloudVoidTheme.colors.textPrimary} />
                </View>
              )}
              <View style={styles.merchantBadge}>
                <Ionicons name="medal" size={14} color={CloudVoidTheme.colors.textPrimary} />
              </View>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.merchantAlias}>{alias}</Text>
              <View style={styles.legalNameRow}>
                <Text style={styles.merchantTitle}>Victor Moore</Text>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={{marginLeft: 6}} />
              </View>
              <Text style={styles.memberSince}>Member since Oct 2024</Text>
              <Text style={styles.accountId}>Merchant ID: M89...34AC</Text>
            </View>
          </View>
          
          <View style={styles.trustScoreContainer}>
            <Text style={styles.trustScoreText}>Trust Score: 114 / 120</Text>
            <View style={styles.trustScoreBar}>
              <View style={[styles.trustScoreFill, { width: `95%` }]} />
            </View>
          </View>

          <Text style={styles.performanceText}>200+ P2P Transactions with 100% Completion</Text>
        </View>

        {/* Linked Business Bank Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Business Bank Accounts</Text>
          
          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <Text style={styles.opayIcon}>OPay</Text>
              <View>
                <Text style={styles.paymentTitle}>OPay - [Business Name]</Text>
                <Text style={styles.paymentSub}>**** 1234</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editPaymentBtn}
              onPress={() => {
                setEditingBank({ bankName: 'OPay', accountName: 'TrustedTradePro Business', accountNumber: '8123456789' });
                setShowEditBankModal(true);
              }}
            >
              <Ionicons name="pencil" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <Ionicons name="business" size={24} color="#60a5fa" style={{marginRight: 12}} />
              <View>
                <Text style={styles.paymentTitle}>Access Bank - [Business Name]</Text>
                <Text style={styles.paymentSub}>**** 5678</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editPaymentBtn}
              onPress={() => {
                setEditingBank({ bankName: 'Access Bank', accountName: 'TrustedTradePro Business', accountNumber: '0698765432' });
                setShowEditBankModal(true);
              }}
            >
              <Ionicons name="pencil" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.addMethodBtn}
            onPress={() => navigation.navigate('AddPaymentMethod')}
          >
            <Text style={styles.addMethodBtnText}>Add/Manage Business Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.configureLiquidityBtn}
            onPress={() => navigation.navigate('LiquidityPricingSetup')}
          >
            <Text style={styles.configureLiquidityBtnText}>Configure Liquidity & Pricing</Text>
          </TouchableOpacity>
        </View>

        {/* Community Arbitration Hub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Arbitration Hub</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Active Requests</Text>
              <Text style={styles.statValue}>→ 3</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Completed Cases</Text>
              <Text style={styles.statValue}>→ 15</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Accuracy Rate</Text>
              <Text style={styles.statValue}>→ 100%</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.arbitrationBtnPrimary} onPress={() => navigation.navigate('JuryCenter')}>
            <Text style={styles.arbitrationBtnPrimaryText}>View Active Jury Requests</Text>
            <View style={styles.badgeWarning}>
              <Text style={styles.badgeWarningText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.arbitrationBtnSecondary} onPress={() => navigation.navigate('ArbitrationLedger')}>
            <Text style={styles.arbitrationBtnSecondaryText}>View Completed & Abandoned Cases</Text>
          </TouchableOpacity>
        </View>

        {/* Merchant Transaction Ledger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Merchant Transaction Ledger</Text>
          
          <View style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconContainer, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="logo-bitcoin" size={16} color={CloudVoidTheme.colors.textPrimary} />
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: '#22c55e' }]}>+500 USDT (Sale)</Text>
                <Text style={styles.txSecondary}>OPay</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmountNegative}>-1000 USDT</Text>
              <Text style={styles.txAmountDetails}>$39.88  <Text style={{color: '#ef4444'}}>-20%</Text></Text>
            </View>
          </View>

          <View style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconContainer, { backgroundColor: '#26a17b' }]}>
                <Text style={{color: CloudVoidTheme.colors.textPrimary, fontSize: 16, fontWeight: '700'}}>₮</Text>
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: '#22c55e' }]}>+250 USDT (Sale)</Text>
                <Text style={styles.txSecondary}>(Sale)</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmountNegative}>-300 USDT</Text>
              <Text style={styles.txAmountDetails}>$10.73  <Text style={{color: '#22c55e'}}>-30%</Text></Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewHistoryBtn} onPress={() => navigation.navigate('P2PTransactionHistory')}>
            <Text style={styles.viewHistoryText}>View Full Merchant Ledger</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Settings Bottom Sheet Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowSettings(false)} 
          />
          <View style={styles.settingsSheet}>
            <View style={styles.sheetHandleModal} />
            <Text style={styles.sheetTitleModal}>Merchant Profile Settings</Text>

            <View style={styles.sheetContent}>
              
              {/* Editable Avatar */}
              <TouchableOpacity style={styles.editAvatarContainer} onPress={handleUploadAvatar}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.editAvatarImage} />
                ) : (
                  <View style={styles.editAvatarPlaceholder}>
                    <Text style={styles.editAvatarText}>M</Text>
                  </View>
                )}
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={14} color={CloudVoidTheme.colors.textPrimary} />
                </View>
              </TouchableOpacity>
              <Text style={styles.editAvatarLabel}>Tap to change avatar</Text>

              {/* Alias Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Merchant Alias Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempAlias}
                  onChangeText={setTempAlias}
                  placeholder="Enter your merchant alias"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <TouchableOpacity style={styles.saveSettingsBtn} onPress={handleSaveSettings}>
                <Text style={styles.saveSettingsBtnText}>Save Changes</Text>
              </TouchableOpacity>

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Bank Account Modal */}
      <Modal
        visible={showEditBankModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditBankModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowEditBankModal(false)} 
          />
          <View style={styles.settingsSheet}>
            <View style={styles.sheetHandleModal} />
            <Text style={styles.sheetTitleModal}>Edit Bank Account</Text>

            <View style={styles.sheetContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingBank?.bankName || ''}
                  onChangeText={(t) => setEditingBank({...editingBank, bankName: t})}
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingBank?.accountName || ''}
                  onChangeText={(t) => setEditingBank({...editingBank, accountName: t})}
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingBank?.accountNumber || ''}
                  onChangeText={(t) => setEditingBank({...editingBank, accountNumber: t})}
                  keyboardType="numeric"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <TouchableOpacity style={styles.saveSettingsBtn} onPress={() => setShowEditBankModal(false)}>
                <Text style={styles.saveSettingsBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePicker(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.imagePickerSheet}>
            <View style={styles.sheetHandleModal} />
            <Text style={styles.sheetTitleModal}>Choose Your Avatar</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.avatarGridItem}
                    onPress={() => {
                      setAvatarSource(img);
                      setShowImagePicker(false);
                    }}
                  >
                    <Image source={img} style={styles.avatarGridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
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
  },
  headerBtnRight: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  settingsText: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: '#1c1c24',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eab308', // Gold border for pro merchant
  },
  merchantBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#eab308',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1c1c24',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  merchantAlias: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  merchantTitle: {
    color: CloudVoidTheme.colors.textHeader,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  memberSince: {
    color: '#6b7280',
    fontSize: 12,
  },
  accountId: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  trustScoreContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  trustScoreText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  trustScoreBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trustScoreFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  performanceText: {
    color: '#e5e7eb',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opayIcon: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 12,
    width: 24,
  },
  paymentTitle: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentSub: {
    color: '#9ca3af',
    fontSize: 11,
  },
  editPaymentBtn: {
    padding: 8,
  },
  addMethodBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addMethodBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  configureLiquidityBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  configureLiquidityBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  arbitrationBtnPrimary: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  arbitrationBtnPrimaryText: {
    color: '#c4b5fd',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  badgeWarning: {
    backgroundColor: '#f59e0b',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeWarningText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  arbitrationBtnSecondary: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  arbitrationBtnSecondaryText: {
    color: '#7dd3fc',
    fontSize: 14,
    fontWeight: '600',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txPrimary: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  txSecondary: {
    color: '#9ca3af',
    fontSize: 13,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmountNegative: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  txAmountDetails: {
    color: '#9ca3af',
    fontSize: 12,
  },
  viewHistoryBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  viewHistoryText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },

  // Legal name row
  legalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  // Modal / Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  settingsSheet: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sheetHandleModal: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitleModal: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  sheetContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  editAvatarContainer: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  editAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarText: {
    color: '#1f2937',
    fontSize: 32,
    fontWeight: '700',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: CloudVoidTheme.colors.btnBg,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  editAvatarLabel: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveSettingsBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveSettingsBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  imagePickerSheet: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    height: '60%',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 40,
  },
  avatarGridItem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarGridImage: {
    width: '100%',
    height: '100%',
  },
});
