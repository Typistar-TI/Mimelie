'use client';

import { useState } from 'react';

export function PixCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="rounded-2xl bg-[#f3d0bd] p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#9f4d4d]">
        PIX copia e cola
      </p>
      <code className="mt-2 block max-h-32 overflow-auto break-all rounded-xl bg-[#fefbf3] p-3 text-[11px] leading-5 text-[#542a30]">
        {code}
      </code>
      <button
        className="mt-3 rounded-full bg-[#542a30] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[.14em] text-white transition hover:bg-[#9f4d4d]"
        type="button"
        onClick={copy}
      >
        {copied ? 'Copiado ✓' : 'Copiar código PIX'}
      </button>
    </div>
  );
}
