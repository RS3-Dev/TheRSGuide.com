import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Cinzel, Nunito } from 'next/font/google';
import { PlayerDataProvider } from '@/mdx_components/components/player-data-context';
import type { Metadata } from 'next';
import Script from 'next/script';

// Display font for headings - fantasy/medieval feel
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// Body font - friendly and readable
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://thersguide.com'),
  title: 'The RS Guide - A comprehensive guide to RuneScape',
  description: 'Beginner RuneScape guide with detailed tutorials, setup instructions, and training guides for every skill. Perfect for new and experienced players',
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body className="flex flex-col font-[family-name:var(--font-body)]" suppressHydrationWarning>
        <Script
          defer
          src="https://traffic.imjoshj.com/api/v1/track/script.js?site=thersguide"
        />
        <RootProvider>
          <PlayerDataProvider>
            {children}
          </PlayerDataProvider>
        </RootProvider>
      </body>
    </html>
  );
}
