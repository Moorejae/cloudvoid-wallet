/**
 * QRCode.tsx — Renders a REAL, scannable QR code entirely with react-native-svg.
 *
 * Uses the tiny pure-JS `qrcode-generator` encoder (no native deps, no WASM), so
 * the exact same component works on web, iOS and Android. The encoded payload is
 * a plain URI string (e.g. an address or a `cloudvoid:` receive link).
 */
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import qrcode from 'qrcode-generator';

interface QRCodeProps {
  value: string;
  size?: number;
  /** Optional quiet-zone padding in QR modules (default 2, per spec). */
  quiet?: number;
  color?: string;
  backgroundColor?: string;
}

export default function QRCode({
  value,
  size = 220,
  quiet = 2,
  color = '#000000',
  backgroundColor = '#ffffff',
}: QRCodeProps) {
  const { cells, count, moduleSize } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value || '');
    qr.make();
    const count = qr.getModuleCount();
    const total = count + quiet * 2;
    const moduleSize = size / total;
    const cells: { x: number; y: number }[] = [];
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          cells.push({
            x: (col + quiet) * moduleSize,
            y: (row + quiet) * moduleSize,
          });
        }
      }
    }
    return { cells, count, moduleSize };
  }, [value, size, quiet]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />
      {cells.map((c, i) => (
        <Rect
          key={i}
          x={c.x}
          y={c.y}
          width={moduleSize + 0.25}
          height={moduleSize + 0.25}
          fill={color}
        />
      ))}
    </Svg>
  );
}
