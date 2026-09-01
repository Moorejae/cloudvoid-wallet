import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, TextInput, Image, KeyboardAvoidingView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';

export default function UserAccountDashboardScreen({ navigation }: any) {
  const trustPoints = useWalletStore((state) => state.trustPoints);

  const [showSettings, setShowSettings] = useState(false);
  const [alias, setAlias] = useState('');
  const [tempAlias, setTempAlias] = useState(alias);
  const [avatarSource, setAvatarSource] = useState<any>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // States for editable payment methods
  const [opayNumber, setOpayNumber] = useState('');
  const [opayName, setOpayName] = useState('');
  const [opayBank, setOpayBank] = useState('');

  const [accessNumber, setAccessNumber] = useState('');
  const [accessName, setAccessName] = useState('');
  const [accessBank, setAccessBank] = useState('');

  const [editingMethod, setEditingMethod] = useState<'opay' | 'access' | null>(null);
  const [tempNumber, setTempNumber] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempBank, setTempBank] = useState('');

  const AVATAR_OPTIONS = [
    require('../../assets/avatars/Gemini_Generated_Image_1pu0vj1pu0vj1pu0.png'),
    require('../../assets/avatars/Gemini_Generated_Image_3lpivw3lpivw3lpi.png'),
    require('../../assets/avatars/Gemini_Generated_Image_88vdob88vdob88vd.png'),
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

  const handleSavePaymentNumber = () => {
    if (editingMethod === 'opay') {
      setOpayNumber(tempNumber);
      setOpayName(tempName);
      setOpayBank(tempBank);
    } else if (editingMethod === 'access') {
      setAccessNumber(tempNumber);
      setAccessName(tempName);
      setAccessBank(tempBank);
    }
    setEditingMethod(null);
  };

  const handleEditPaymentClick = (method: 'opay' | 'access') => {
    setEditingMethod(method);
    if (method === 'opay') {
      setTempNumber(opayNumber);
      setTempName(opayName);
      setTempBank(opayBank);
    } else {
      setTempNumber(accessNumber);
      setTempName(accessName);
      setTempBank(accessBank);
    }
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
        <Text style={styles.headerTitle}>Account Dashboard</Text>
        <TouchableOpacity style={styles.headerBtnRight} onPress={() => {
          setTempAlias(alias);
          setShowSettings(true);
        }}>
          <Ionicons name="settings-outline" size={20} color="#a78bfa" />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarCircleImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>G</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={CloudVoidTheme.colors.textPrimary} />
            </View>
          </View>
          
          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>Victor Moore</Text>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={{ marginLeft: 6, marginTop: -2 }} />
          </View>
          <Text style={styles.userAlias}>{alias}</Text>
          
          <Text style={styles.memberSince}>Member since Oct 2024</Text>
          <Text style={styles.accountId}>Account ID: CYD9...S4AC</Text>

          <View style={styles.trustScoreContainer}>
            <Text style={styles.trustScoreText}>Trust Score: {trustPoints} / 120</Text>
            <View style={styles.trustScoreBar}>
              <View style={[styles.trustScoreFill, { width: `${(trustPoints / 120) * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* P2P Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>P2P Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Trades →</Text>
              <Text style={styles.statValue}>226</Text>
              <Text style={styles.statSub}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Completion →</Text>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statSub}>Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Release →</Text>
              <Text style={styles.statValue}>2.1 Min</Text>
              <Text style={styles.statSub}>Stats</Text>
            </View>
          </View>
        </View>

        {/* Linked Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Payment Methods</Text>
          
          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <Ionicons name="business" size={24} color="#22c55e" style={{marginRight: 12}} />
              <View>
                <Text style={styles.paymentTitle}>{opayBank} - {opayName}</Text>
                <Text style={styles.paymentSub}>{opayNumber}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editPaymentBtn} 
              onPress={() => handleEditPaymentClick('opay')}
            >
              <Ionicons name="create-outline" size={20} color="#a78bfa" />
            </TouchableOpacity>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <Ionicons name="business" size={24} color="#60a5fa" style={{marginRight: 12}} />
              <View>
                <Text style={styles.paymentTitle}>{accessBank} - {accessName}</Text>
                <Text style={styles.paymentSub}>{accessNumber}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editPaymentBtn} 
              onPress={() => handleEditPaymentClick('access')}
            >
              <Ionicons name="create-outline" size={20} color="#a78bfa" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.addMethodBtn}
            onPress={() => navigation.navigate('AddPaymentMethod')}
          >
            <Text style={styles.addMethodBtnText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Recent P2P Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent P2P Transactions</Text>
          
          <View style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconContainer, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="logo-bitcoin" size={16} color={CloudVoidTheme.colors.textPrimary} />
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: '#22c55e' }]}>+0.05 BTC <Text style={styles.txLight}>(Sale)</Text></Text>
                <Text style={styles.txSecondary}>Sale</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmountNegative}>-250 USDT</Text>
              <Text style={styles.txAmountDetails}>$28.30  <Text style={{color: '#ef4444'}}>-20%</Text></Text>
            </View>
          </View>

          <View style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconContainer, { backgroundColor: '#26a17b' }]}>
                <Text style={{color: CloudVoidTheme.colors.textPrimary, fontSize: 16, fontWeight: '700'}}>₮</Text>
              </View>
              <View>
                <Text style={[styles.txPrimary, { color: '#22c55e' }]}>+500 USDT</Text>
                <Text style={styles.txSecondary}>Deposit</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmountNegative}>-380 USDT</Text>
              <Text style={styles.txAmountDetails}>$107.73  <Text style={{color: '#ef4444'}}>-30%</Text></Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.viewHistoryBtn}
            onPress={() => navigation.navigate('P2PTransactionHistory')}
          >
            <Text style={styles.viewHistoryText}>View Full Transaction History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Edit Payment Number Modal */}
      <Modal
        visible={editingMethod !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingMethod(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setEditingMethod(null)} 
          />
          <View style={styles.editPaymentSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Edit Payment Method</Text>
            
            <Text style={styles.inputLabel}>Account Name</Text>
            <TextInput
              style={styles.sheetInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter Account Name"
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput
              style={styles.sheetInput}
              value={tempBank}
              onChangeText={setTempBank}
              placeholder="Enter Bank Name"
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.sheetInput}
              value={tempNumber}
              onChangeText={setTempNumber}
              placeholder="Enter Account Number"
              placeholderTextColor="#6b7280"
              keyboardType="default"
            />

            <TouchableOpacity style={styles.sheetSaveBtn} onPress={handleSavePaymentNumber}>
              <Text style={styles.sheetSaveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Profile Settings</Text>

            <View style={styles.sheetContent}>
              
              {/* Editable Avatar */}
              <TouchableOpacity style={styles.editAvatarContainer} onPress={handleUploadAvatar}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.editAvatarImage} />
                ) : (
                  <View style={styles.editAvatarPlaceholder}>
                    <Text style={styles.editAvatarText}>G</Text>
                  </View>
                )}
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={14} color={CloudVoidTheme.colors.textPrimary} />
                </View>
              </TouchableOpacity>
              <Text style={styles.editAvatarLabel}>Tap to change avatar</Text>

              {/* Alias Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>P2P Alias Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempAlias}
                  onChangeText={setTempAlias}
                  placeholder="Enter your alias"
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
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose Your Avatar</Text>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22c55e',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1c1c24',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  userAlias: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  memberSince: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 2,
  },
  accountId: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 16,
  },
  trustScoreContainer: {
    width: '100%',
    alignItems: 'center',
  },
  trustScoreText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  trustScoreBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trustScoreFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 2,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statSub: {
    color: '#6b7280',
    fontSize: 10,
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
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addMethodBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txPrimary: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  txLight: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  txSecondary: {
    color: '#6b7280',
    fontSize: 11,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmountNegative: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  txAmountDetails: {
    color: '#9ca3af',
    fontSize: 11,
  },
  viewHistoryBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  viewHistoryText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  spacer: {
    height: 40,
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
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: CloudVoidTheme.colors.textHeader,
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
  editPaymentSheet: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sheetInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  sheetSaveBtn: {
    backgroundColor: CloudVoidTheme.colors.btnBg,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetSaveBtnText: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
