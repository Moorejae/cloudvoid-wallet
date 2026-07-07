import { Platform } from 'react-native';

export const darkTokens = {
  '--bg': '#000000',
  '--bgInternal': '#0b0b0e',
  '--surface': '#1a1a1a',
  '--surfaceElevated': '#2a2a2a',
  '--accent': '#8b5cf6',
  '--accentDark': '#4c1d95',
  '--accentGlow': '#a78bfa',
  '--textPrimary': '#ffffff',
  '--textSecondary': '#9ca3af',
  '--textDisabled': '#4b5563',
  '--border': 'rgba(255,255,255,0.08)',
  '--success': '#22c55e',
  '--danger': '#ef4444',
  '--warning': '#f59e0b',
  '--whiteText': '#ffffff',
  '--textHeader': '#ffffff',
  '--textSubHeader': '#a78bfa',
  '--btnBg': '#8b5cf6',
  '--btnText': '#ffffff',
  '--backBtn': '#a78bfa'
};

export const lightTokens = {
  '--bg': '#ffffff',
  '--bgInternal': '#f8fafc',
  '--surface': '#ffffff',
  '--surfaceElevated': '#f1f5f9',
  '--accent': '#7c3aed',
  '--accentDark': '#5b21b6',
  '--accentGlow': '#c4b5fd',
  '--textPrimary': '#0f172a',
  '--textSecondary': '#64748b',
  '--textDisabled': '#94a3b8',
  '--border': 'rgba(0,0,0,0.1)',
  '--success': '#16a34a',
  '--danger': '#dc2626',
  '--warning': '#d97706',
  '--whiteText': '#ffffff',
  '--textHeader': '#0f172a',
  '--textSubHeader': '#7c3aed',
  '--btnBg': '#7c3aed',
  '--btnText': '#ffffff',
  '--backBtn': '#7c3aed'
};

export function applyTheme(mode: 'dark' | 'light') {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const root = document.documentElement;
    const tokens = mode === 'light' ? lightTokens : darkTokens;
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
}

// Initial bootstrap fallback
applyTheme('dark');

export const CloudVoidTheme = {
  colors: {
    bg: 'var(--bg)',
    bgInternal: 'var(--bgInternal)',
    surface: 'var(--surface)',
    surfaceElevated: 'var(--surfaceElevated)',
    accent: 'var(--accent)',
    accentDark: 'var(--accentDark)',
    accentGlow: 'var(--accentGlow)',
    textPrimary: 'var(--textPrimary)',
    textSecondary: 'var(--textSecondary)',
    textDisabled: 'var(--textDisabled)',
    border: 'var(--border)',
    success: 'var(--success)',
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    whiteText: 'var(--whiteText)',
    textHeader: 'var(--textHeader)',
    textSubHeader: 'var(--textSubHeader)',
    btnBg: 'var(--btnBg)',
    btnText: 'var(--btnText)',
    backBtn: 'var(--backBtn)',
  },
  radii: {
    card: 20,
    button: 12,
    input: 12,
    pill: 9999,
    iconButton: 16,
  },
  shadows: {
    neonViolet: {
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    neonDark: {
      shadowColor: '#4c1d95',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 8,
    },
  },
  layout: {
    maxWidth: 450,
    screenPadding: 20,
  }
} as const;
