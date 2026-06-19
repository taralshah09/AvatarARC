import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'AvatarARC — Your real-life player card',
    template: '%s | AvatarARC',
  },
  description:
    'Connect GitHub, Chess.com, Strava, and more. AvatarARC scores you across 6 axes and generates a FIFA-style player card from your actual activity.',
  openGraph: {
    siteName: 'AvatarARC',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/og-default.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@avatararc',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
