import type { Metadata } from 'next';
import { brand } from './brand';

export const siteConfig = {
  ...brand,
  socialImage: {
    url: '/media/social/mimelie-og.png',
    width: 1200,
    height: 630,
    type: 'image/png',
    alt: 'Mimelie — maquiagem e cílios com delicadeza',
  },
} as const;

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  index?: boolean;
  follow?: boolean;
  imageAlt?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
  follow = true,
  imageAlt = siteConfig.socialImage.alt,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} — ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: index ? { canonical: path } : undefined,
    robots: {
      index,
      follow,
      nocache: !index,
      googleBot: {
        index,
        follow,
        noimageindex: !index,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: path,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [{ ...siteConfig.socialImage, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [{ url: siteConfig.socialImage.url, alt: imageAlt }],
    },
  };
}

export function privatePageMetadata(title: string, description: string): Metadata {
  return pageMetadata({ title, description, path: '/', index: false, follow: false });
}
