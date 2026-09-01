/**
 * TokenIcon.tsx — token logo with a graceful letter-avatar fallback.
 *
 * Some coin logo URLs (e.g. Monero via TrustWallet) 404. Instead of rendering
 * a broken/empty image, this shows a colored circle with the token's first
 * letter whenever the remote image fails to load.
 */
import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';

interface TokenIconProps {
  symbol: string;
  uri?: string;
  size?: number;
  radius?: number;
}

const COLORS = ['#8B5CF6', '#3B99FC', '#10B981', '#F59E0B', '#EC4899', '#F43F5E', '#38BDF8', '#A78BFA'];

export default function TokenIcon({ symbol, uri, size = 32, radius = 8 }: TokenIconProps) {
  const [failed, setFailed] = useState(false);
  const letter = (symbol || '?').slice(0, 1).toUpperCase();
  const bg = COLORS[(letter.charCodeAt(0) || 65) % COLORS.length];

  if (!uri || failed) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: Math.round(size * 0.48), fontWeight: '700' }}>{letter}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: radius }}
      onError={() => setFailed(true)}
    />
  );
}
