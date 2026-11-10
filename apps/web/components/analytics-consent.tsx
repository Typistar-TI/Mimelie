'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Drawer } from './drawer';

const KEY = 'mimelie-cookie-preferences-v1';
type Preferences = { essential: true; analytics: boolean; updatedAt: string };

function startAnalytics() {
  // Cloudflare Web Analytics é ativado no painel da Cloudflare e não usa
  // cookies nem script de terceiros. Nada a inicializar no cliente.
}

export function AnalyticsConsent() {
  const [saved, setSaved] = useState<Preferences | null | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    let preferences: Preferences | null = null;
    try { preferences = raw ? JSON.parse(raw) as Preferences : null; } catch { localStorage.removeItem(KEY); }
    setSaved(preferences);
    setAnalytics(preferences?.analytics ?? false);
    if (preferences?.analytics) startAnalytics();
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener('mimelie:open-cookie-settings', openSettings);
    return () => window.removeEventListener('mimelie:open-cookie-settings', openSettings);
  }, []);

  function save(allowAnalytics: boolean) {
    const preferences: Preferences = { essential: true, analytics: allowAnalytics, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(preferences));
    setSaved(preferences);
    setAnalytics(allowAnalytics);
    setSettingsOpen(false);
    if (allowAnalytics) startAnalytics();
  }

  return <>
    {saved === null && <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-[1.5rem] border border-[#542a30]/15 bg-[#fefbf3]/95 p-5 shadow-[0_18px_60px_rgba(84,42,48,.22)] backdrop-blur-xl md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6" aria-label="Preferências de cookies"><div><strong className="font-[family-name:var(--font-display)] text-2xl font-semibold">Privacidade, sem letras miúdas.</strong><p className="mt-1 max-w-2xl text-xs leading-5 text-[#765052]">Os cookies essenciais mantêm a loja funcionando. As métricas opcionais só são ativadas se você permitir. <Link className="underline" href="/cookies">Entenda os cookies</Link>.</p></div><div className="mt-5 grid grid-cols-2 gap-2 md:mt-0"><button className="rounded-full border border-[#542a30] px-4 py-3 text-[11px] font-bold" type="button" onClick={()=>setSettingsOpen(true)}>Personalizar</button><button className="rounded-full bg-[#542a30] px-4 py-3 text-[11px] font-bold text-white" type="button" onClick={()=>save(true)}>Aceitar todos</button><button className="col-span-2 text-[10px] font-bold text-[#765052] underline" type="button" onClick={()=>save(false)}>Continuar só com os essenciais</button></div></aside>}
    <Drawer open={settingsOpen} onClose={()=>setSettingsOpen(false)} side="right" eyebrow="Sua privacidade" title="Preferências de cookies"><div className="flex min-h-full flex-col p-6"><p className="text-sm leading-6 text-[#765052]">Você pode mudar esta escolha quando quiser pelo rodapé. A loja funciona mesmo sem cookies de análise.</p><div className="mt-8 divide-y divide-[#542a30]/15 border-y border-[#542a30]/15"><Preference title="Essenciais" text="Sessão, sacola, segurança e preferências básicas da loja." checked disabled/><Preference title="Métricas de uso" text="Ajudam a entender visitas, erros e etapas da compra para melhorar a experiência." checked={analytics} onChange={setAnalytics}/></div><Link className="mt-5 text-xs font-bold underline" href="/cookies" onClick={()=>setSettingsOpen(false)}>Ler a política de cookies</Link><div className="mt-auto grid gap-2 pt-10"><button className="rounded-full bg-[#542a30] px-5 py-4 text-xs font-extrabold text-white" type="button" onClick={()=>save(analytics)}>Salvar preferências</button><button className="rounded-full border border-[#542a30] px-5 py-4 text-xs font-extrabold" type="button" onClick={()=>save(false)}>Recusar opcionais</button></div></div></Drawer>
  </>;
}

function Preference({ title, text, checked, disabled = false, onChange }: { title: string; text: string; checked: boolean; disabled?: boolean; onChange?: (value: boolean) => void }) {
  return <label className={`flex items-start justify-between gap-5 py-6 ${disabled?'cursor-default':'cursor-pointer'}`}><span><b className="block text-sm">{title}</b><small className="mt-1 block leading-5 text-[#765052]">{text}</small></span><span className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${checked?'bg-[#9f4d4d]':'bg-[#d9cbc2]'}`}><input className="sr-only" type="checkbox" checked={checked} disabled={disabled} onChange={(event)=>onChange?.(event.target.checked)}/><i className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${checked?'left-6':'left-1'}`}/></span></label>;
}
