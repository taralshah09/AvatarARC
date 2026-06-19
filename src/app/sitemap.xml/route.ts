import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://avatararc.vercel.app';

  const users = await prisma.user.findMany({
    where: { username: { not: null } },
    select: { username: true, updatedAt: true },
    take: 1000,
    orderBy: { updatedAt: 'desc' },
  });

  const staticPages = [
    { url: appUrl, priority: '1.0' },
    { url: `${appUrl}/leaderboard`, priority: '0.7' },
  ];

  const cardPages = users
    .filter((u) => u.username)
    .map((u) => ({
      url: `${appUrl}/card/${u.username}`,
      lastmod: u.updatedAt.toISOString().split('T')[0],
      priority: '0.8',
    }));

  const allPages = [
    ...staticPages.map((p) => `
    <url>
      <loc>${p.url}</loc>
      <priority>${p.priority}</priority>
    </url>`),
    ...cardPages.map((p) => `
    <url>
      <loc>${p.url}</loc>
      <lastmod>${p.lastmod}</lastmod>
      <priority>${p.priority}</priority>
    </url>`),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
