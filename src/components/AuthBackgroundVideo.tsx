import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const desktopVideoSource = require('../../assets/auth_background_desktop.mp4');
const mobileVideoSource = require('../../assets/auth_background_mobile.mp4');

interface AuthBackgroundVideoProps {
  children?: React.ReactNode;
  overlayOpacity?: number;
}

export default function AuthBackgroundVideo({
  children,
  overlayOpacity = 0.6,
}: AuthBackgroundVideoProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Web-specific rendering for zero-glitch autoplay & responsive media switching
  if (Platform.OS === 'web') {
    const desktopUrl =
      typeof desktopVideoSource === 'string'
        ? desktopVideoSource
        : desktopVideoSource?.default || desktopVideoSource?.uri || '/auth_background_desktop.mp4';

    const mobileUrl =
      typeof mobileVideoSource === 'string'
        ? mobileVideoSource
        : mobileVideoSource?.default || mobileVideoSource?.uri || '/auth_background_mobile.mp4';

    const activeVideoSrc = isDesktop ? desktopUrl : mobileUrl;

    return (
      <View style={styles.container}>
        <video
          key={isDesktop ? 'desktop-clip' : 'mobile-clip'}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <source src={activeVideoSrc} type="video/mp4" />
        </video>

        {/* Ambient Dark Sci-Fi Overlay (no top/bottom veil) */}
        <View
          style={[
            styles.overlay,
            { backgroundColor: `rgba(6, 8, 16, ${overlayOpacity})` },
          ]}
        />

        {/* Foreground Content */}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // Native (iOS/Android) rendering with expo-video
  return (
    <NativeBackgroundVideo isDesktop={isDesktop} overlayOpacity={overlayOpacity}>
      {children}
    </NativeBackgroundVideo>
  );
}

function NativeBackgroundVideo({
  children,
  overlayOpacity = 0.6,
  isDesktop,
}: AuthBackgroundVideoProps & { isDesktop: boolean }) {
  const activeSource = isDesktop ? desktopVideoSource : mobileVideoSource;

  const player = useVideoPlayer(activeSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={StyleSheet.absoluteFill as any}
        player={player}
        showsTimecodes={false}
        nativeControls={false}
        contentFit="cover"
      />
      <View
        style={[
          styles.overlay,
          { backgroundColor: `rgba(6, 8, 16, ${overlayOpacity})` },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060810',
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
    position: 'relative',
  },
});
