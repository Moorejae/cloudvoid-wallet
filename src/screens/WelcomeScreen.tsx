import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { CloudVoidTheme } from '../theme/tokens';
import { useWalletStore } from '../stores/walletStore';
import { TRANSLATIONS } from '../utils/translations';

const TAGLINES = [
  "WAKE UP, INVEST, SLEEP.",
  "BUILD THE FUTURE YOU WANT.",
  "BRINGS AUTONOMY BACK TO YOU.",
  "WE ARE ALL CLOUDS IN THE VOID."
];

export default function WelcomeScreen({ navigation }: any) {
  const [taglineIdx, setTaglineIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const selectedLanguage = useWalletStore((state) => state.selectedLanguage);
  const t = (Platform.OS === 'web' && selectedLanguage !== 'English')
    ? TRANSLATIONS.English 
    : (TRANSLATIONS[selectedLanguage] || TRANSLATIONS.English);

  useEffect(() => {
    // Tagline rotation timer
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      }).start(() => {
        setTaglineIdx((prev) => (prev + 1) % TAGLINES.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }).start();
      });
    }, 10000);

    // Insignia pulse glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Rotating Tagline */}
      <View style={styles.taglineWrapper}>
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          {TAGLINES[taglineIdx]}
        </Animated.Text>
      </View>

      {/* Glowing Insignia */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.insigniaOuter, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.insigniaInner}>
            <Text style={styles.insigniaGlyph}>☁️</Text>
            <Text style={styles.logoText}>VOID</Text>
          </View>
        </Animated.View>
      </View>

      {/* Actions */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.btn, styles.loginBtn, CloudVoidTheme.shadows.neonDark]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnText}>{t.login}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.registerBtn, CloudVoidTheme.shadows.neonViolet]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.btnText}>{t.register}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: CloudVoidTheme.layout.screenPadding,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  taglineWrapper: {
    marginTop: 60,
    width: '100%',
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: CloudVoidTheme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  insigniaOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 2,
    borderColor: CloudVoidTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CloudVoidTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },
  insigniaInner: {
    alignItems: 'center',
  },
  insigniaGlyph: {
    fontSize: 50,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: CloudVoidTheme.colors.textPrimary,
    letterSpacing: 6,
    marginTop: 4,
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: CloudVoidTheme.layout.maxWidth,
  },
  btn: {
    flex: 0.48,
    borderRadius: CloudVoidTheme.radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    backgroundColor: CloudVoidTheme.colors.accentDark,
  },
  registerBtn: {
    backgroundColor: CloudVoidTheme.colors.accent,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: CloudVoidTheme.colors.btnText,
  },
});
