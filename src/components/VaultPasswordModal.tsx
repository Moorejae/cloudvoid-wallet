import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';

interface Props {
  visible: boolean;
  mode: 'set' | 'unlock';
  onCancel?: () => void;
  onConfirm: (password: string) => void;
  error?: string | null;
}

/**
 * Web-only vault password capture. `set`: create a password that encrypts the
 * mnemonic (PBKDF2 + AES-GCM). `unlock`: enter it to decrypt for signing.
 * Native (iOS/Android) uses SecureStore and does not need this modal.
 */
export default function VaultPasswordModal({ visible, mode, onCancel, onConfirm, error }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const reset = () => {
    setPassword('');
    setConfirm('');
  };

  const submit = () => {
    if (mode === 'set' && password !== confirm) return;
    if (!password) return;
    onConfirm(password);
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'set' ? 'Create Vault Password' : 'Unlock Vault'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'set'
              ? 'This password encrypts your keys on this device. It cannot be recovered if lost.'
              : 'Enter your vault password to decrypt your keys.'}
          </Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={CloudVoidTheme.colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {mode === 'set' && (
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Confirm password"
              placeholderTextColor={CloudVoidTheme.colors.textDisabled}
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, !password && styles.buttonDisabled]}
            onPress={submit}
            disabled={!password}
          >
            <Text style={styles.buttonText}>{mode === 'set' ? 'Encrypt & Continue' : 'Unlock'}</Text>
          </TouchableOpacity>
          {onCancel && mode === 'unlock' && (
            <TouchableOpacity onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: CloudVoidTheme.colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  title: {
    color: CloudVoidTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  input: {
    backgroundColor: CloudVoidTheme.colors.bgInternal,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: CloudVoidTheme.colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CloudVoidTheme.colors.border,
  },
  error: {
    color: CloudVoidTheme.colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: CloudVoidTheme.colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: CloudVoidTheme.colors.btnText,
    fontSize: 16,
    fontWeight: '700',
  },
  cancel: {
    alignItems: 'center',
    marginTop: 14,
  },
  cancelText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 15,
  },
});
