'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { request } from '../app/api/client';

export function FavoriteButton({ offerId }: { offerId: string }) {
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      request<{ ok: true }>(`/api/offers/${offerId}/favorite`, {
        method: 'POST',
      }),
  });

  if (saved) {
    return (
      <span className="mt-3 block w-max rounded-full bg-[#f3d0bd] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#542a30]">
        Salvo nos favoritos ✓
      </span>
    );
  }

  if (mutation.isError) {
    return (
      <Link
        className="mt-3 block w-max rounded-full border border-[#542a30] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[.14em] transition hover:bg-[#542a30] hover:text-white"
        href="/entrar"
      >
        Entre para salvar
      </Link>
    );
  }

  return (
    <button
      className="mt-3 block w-max rounded-full border border-[#542a30] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[.14em] transition hover:bg-[#542a30] hover:text-white disabled:opacity-50"
      type="button"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? 'Salvando…' : 'Salvar oferta'}
    </button>
  );
}
