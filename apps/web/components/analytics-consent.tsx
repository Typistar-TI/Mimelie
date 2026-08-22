'use client';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
const KEY = 'mimelie-analytics-consent';
export function AnalyticsConsent() {
  const [choice, setChoice] = useState<string | null>(null);
  useEffect(() => { const saved = localStorage.getItem(KEY); setChoice(saved); if (saved === 'granted' && process.env.NEXT_PUBLIC_POSTHOG_KEY) posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, { api_host: '/ingest', persistence: 'localStorage+cookie', autocapture: true }); }, []);
  if (choice) return null;
  function decide(value: 'granted' | 'denied') { localStorage.setItem(KEY, value); setChoice(value); if (value === 'granted' && process.env.NEXT_PUBLIC_POSTHOG_KEY) posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, { api_host: '/ingest' }); }
  return <aside className="fixed inset-x-5 bottom-5 z-50 mx-auto grid max-w-3xl grid-cols-2 items-center gap-4 border border-[#542a30] bg-[#fefbf3] p-5 shadow-[8px_8px_0_#c3866b] md:grid-cols-[1fr_auto_auto]" aria-label="Preferências de privacidade"><div className="col-span-2 md:col-span-1"><strong className="font-[family-name:var(--font-display)] text-xl">Você escolhe os ingredientes.</strong><p className="mt-1 text-xs">Usamos métricas opcionais para melhorar a loja. O essencial funciona sem elas.</p></div><button className="border border-[#542a30] px-3 py-3 text-xs hover:bg-[#fbebdc]" onClick={() => decide('denied')}>Somente essenciais</button><button className="border border-[#542a30] bg-[#542a30] px-3 py-3 text-xs text-white hover:bg-[#9f4d4d]" onClick={() => decide('granted')}>Aceitar métricas</button></aside>;
}
