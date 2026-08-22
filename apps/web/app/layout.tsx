import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Cormorant_Garamond, Nunito_Sans } from 'next/font/google';
import { AnalyticsConsent } from '../components/analytics-consent';
import { Header } from '../components/header';
import { Providers } from '../components/providers';
import { PwaRegister } from '../components/pwa-register';
import { brand } from '../lib/brand';
import { pageMetadata, siteConfig } from '../lib/seo';
import './tailwind.css';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display', display: 'swap' });
const body = Nunito_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
export const metadata: Metadata = {
  ...pageMetadata({ title: `${brand.name} — ${brand.tagline}`, description: brand.description, path: '/', absoluteTitle: true }),
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s — ${brand.name}` },
  metadataBase: new URL(siteConfig.siteUrl),
  applicationName: brand.name,
  creator: brand.name,
  publisher: brand.name,
  category: 'beauty',
  manifest: '/manifest.webmanifest',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [{ url: '/icons/favicon-48.png', type: 'image/png', sizes: '48x48' }],
    apple: [{ url: '/icons/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: 'default' },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};
export const viewport: Viewport = { themeColor: '#FEFBF3', colorScheme: 'light', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${display.variable} ${body.variable}`}><body className="m-0 bg-[#fefbf3] font-[family-name:var(--font-body)] text-[15px] text-[#542a30] antialiased"><Providers><Header />{children}<footer className="flex flex-col items-start justify-between gap-9 bg-[#542a30] px-6 py-16 text-white md:flex-row md:items-end md:px-[6vw]"><div><span className="font-[family-name:var(--font-display)] text-6xl font-medium md:text-8xl">{brand.name}</span><p className="mt-2 text-xs text-white/65">Beleza que acompanha você, sem pesar.</p></div><div className="flex gap-6 text-xs"><a href="mailto:oi@example.com" className="hover:text-[#edbfb3]">Contato</a><Link href="/guias/como-escolher-cilios" className="hover:text-[#edbfb3]">Guias</Link><Link href="/admin" className="hover:text-[#edbfb3]">Painel</Link></div></footer><AnalyticsConsent/><PwaRegister /></Providers></body></html>;
}
