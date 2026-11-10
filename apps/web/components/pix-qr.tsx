'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function PixQr({ value }: { value: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 280,
      color: { dark: '#542a30', light: '#fefbf3' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc('');
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (!src) return null;
  return (
    <img
      alt="QR code para pagamento PIX"
      className="size-56 rounded-2xl border border-[#eec0a2] bg-[#fefbf3] p-2"
      src={src}
    />
  );
}
