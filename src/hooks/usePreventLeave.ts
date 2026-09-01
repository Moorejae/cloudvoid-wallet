/**
 * usePreventLeave.ts — Confirm before leaving a screen via the hardware/gesture
 * back button or the in-app back buttons.
 *
 * Uses React Navigation's `beforeRemove` event so it works on Android hardware
 * back, iOS swipe-back, and programmatic goBack. Callers that only want to guard
 * when there is unsaved input should pass `shouldPrevent` accordingly.
 */
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

interface Options {
  title?: string;
  message?: string;
  stayLabel?: string;
  leaveLabel?: string;
}

export function usePreventLeave(
  navigation: any,
  shouldPrevent: boolean,
  opts: Options = {}
) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!shouldPrevent || !navigation) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Only intercept actual "go back" navigation (hardware/gesture back,
      // header back). Forward navigation and programmatic popToTop/popTo are
      // intentionally left alone.
      const type = e?.data?.action?.type;
      if (type && !['GO_BACK', 'POP'].includes(type)) return;

      e.preventDefault();
      const { title = 'Leave this screen?', message = 'Your changes will be lost.', stayLabel = 'Stay', leaveLabel = 'Leave' } = optsRef.current;
      Alert.alert(title, message, [
        { text: stayLabel, style: 'cancel', onPress: () => {} },
        { text: leaveLabel, style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });

    return unsubscribe;
  }, [navigation, shouldPrevent]);
}

/** Convenience guard used by native-only confirmation (kept for parity). */
export function isWebGuardActive(platform = Platform.OS): boolean {
  return platform === 'web';
}
