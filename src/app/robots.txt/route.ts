import { NextResponse } from 'next/server';

export function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://avatararc.vercel.app';
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /api',
    'Disallow: /onboarding',
    '',
    `Sitemap: ${appUrl}/sitemap.xml`,
  ].join('\n');

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
