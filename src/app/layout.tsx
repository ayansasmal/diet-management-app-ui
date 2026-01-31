import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

/**
 * Geist Sans font - Primary typeface
 */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Geist Mono font - Code/numbers
 */
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * App metadata
 */
export const metadata: Metadata = {
  title: {
    default: 'Diet Management App',
    template: '%s | Diet Management App',
  },
  description:
    'Your digital companion for personalized diet management. Track weight, glucose, and meals to improve adherence through daily engagement.',
  keywords: [
    'diet management',
    'low-carb diet',
    'diabetes management',
    'weight tracking',
    'glucose monitoring',
    'meal logging',
  ],
  authors: [{ name: 'Diet Management App' }],
  creator: 'Diet Management App',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    title: 'Diet Management App',
    description: 'Your digital companion for personalized diet management',
    siteName: 'Diet Management App',
  },
};

/**
 * Viewport configuration for PWA
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

/**
 * Root layout - Wraps all pages
 *
 * Includes:
 * - Google Identity Services (GIS) script
 * - Geist fonts
 * - Base styling
 */
/**
 * Theme initialization script (runs before React hydration)
 * Prevents flash of incorrect theme
 * Note: This is a static string, not user input - safe from XSS
 */
const themeScript = `
  (function() {
    var theme = localStorage.getItem('theme');
    var isDark = theme === 'dark' ||
      (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme script - static content, no XSS risk */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
