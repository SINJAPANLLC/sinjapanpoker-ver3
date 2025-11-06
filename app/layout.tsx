import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SJP',
  description: 'SIN JAPAN POKER',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'SJP',
    description: 'SIN JAPAN POKER',
    url: 'https://sinjapan-poker.com',
    siteName: 'SJP',
    images: [
      {
        url: 'https://sinjapan-poker.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'SIN JAPAN POKER',
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SJP',
    description: 'SIN JAPAN POKER',
    images: ['https://sinjapan-poker.com/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="SJP" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}

