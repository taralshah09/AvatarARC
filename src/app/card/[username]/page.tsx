import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { CardDownloadWrapper } from './CardDownloadWrapper';
import { ShareButton } from '@/components/card/ShareButton';
import type { ScoreResult } from '@/lib/scoring';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { score: true },
  });

  const overall = user?.score?.overall ? Math.round(user.score.overall) : null;
  const archetype = user?.score?.archetype ?? null;
  const axesPopulated = user?.score?.axesPopulated ?? 0;

  return {
    title: `${username}'s AvatarARC Card`,
    description:
      overall !== null
        ? `OVR ${overall} · ${archetype ?? 'Novice'} · ${axesPopulated}/6 sources connected on AvatarARC.`
        : `Check out ${username}'s player card on AvatarARC.`,
    openGraph: {
      title: `${username}'s AvatarARC Card`,
      description:
        overall !== null
          ? `OVR ${overall} · ${archetype ?? 'Novice'} · ${axesPopulated}/6 sources`
          : `${username}'s AvatarARC player card`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/card/${username}/og`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${username}'s AvatarARC Card`,
      images: [`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/card/${username}/og`],
    },
  };
}

export default async function CardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { score: true, connectedProviders: { select: { provider: true } } },
  });

  if (!user || !user.score) {
    return notFound();
  }

  const scores: ScoreResult = {
    vitality: user.score.vitality,
    discipline: user.score.discipline,
    logic: user.score.logic,
    strategy: user.score.strategy,
    craft: user.score.craft,
    grit: user.score.grit,
    overall: user.score.overall,
    archetype: user.score.archetype,
    axesPopulated: user.score.axesPopulated,
    xp: user.score.xp,
    level: user.score.level,
  };

  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/card/${username}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <Link href="/" className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-lg hover:opacity-80 transition-opacity">
          AvatarARC
        </Link>
        <p className="text-white/40 tracking-widest uppercase text-xs mt-1">Player Card</p>
      </div>

      <CardDownloadWrapper
        user={{ username: user.username ?? username, displayName: user.displayName, avatarUrl: user.avatarUrl }}
        scores={scores}
        sourcesConnected={user.connectedProviders.length}
      />

      <div className="flex items-center gap-3">
        <ShareButton url={cardUrl} />
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all duration-200"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
