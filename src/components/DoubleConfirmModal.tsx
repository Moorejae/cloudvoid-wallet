import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CloudVoidTheme } from '../theme/tokens';

interface DoubleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmBg?: string;
}

export default function DoubleConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmBg = CloudVoidTheme.colors.danger
}: DoubleConfirmModalProps) {
  const [cooldown, setCooldown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCooldown(3);
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onClose();
  };

  const handleConfirm = () => {
    if (cooldown > 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.warning}>This action cannot be reversed.</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: cooldown > 0 ? CloudVoidTheme.colors.textDisabled : confirmBg }
              ]}
              onPress={handleConfirm}
              disabled={cooldown > 0}
            >
              <Text style={styles.confirmText}>
                {cooldown > 0 ? `${confirmText} (${cooldown}s)` : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: CloudVoidTheme.colors.surface,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
    borderRadius: CloudVoidTheme.radii.card,
    padding: 24,
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textHeader,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: CloudVoidTheme.colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    color: CloudVoidTheme.colors.warning,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  cancelBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: CloudVoidTheme.radii.button,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
  },
  confirmBtn: {
    borderRadius: CloudVoidTheme.radii.button,
    padding: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: CloudVoidTheme.colors.textPrimary,
  },
});
