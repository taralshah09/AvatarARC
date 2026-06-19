'use client';

import { useRef } from 'react';
import { PlayerCard } from '@/components/card/PlayerCard';
import { DownloadButton } from '@/components/card/DownloadButton';
import { SyncButton } from './SyncButton';
import { ShareButton } from '@/components/card/ShareButton';
import type { ScoreResult } from '@/lib/scoring';

interface DashboardCardSectionProps {
  user: {
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    avatarConfig?: unknown;
  };
  scores: ScoreResult;
  sourcesConnected: number;
  shareUrl: string;
}

export function DashboardCardSection({
  user,
  scores,
  sourcesConnected,
  shareUrl,
}: DashboardCardSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Your Card
        </h2>
        <div className="flex items-center gap-2">
          <DownloadButton cardRef={cardRef} username={user.username} />
          <SyncButton />
          <ShareButton url={shareUrl} />
        </div>
      </div>
      <div className="flex justify-start">
        <PlayerCard
          ref={cardRef}
          user={user}
          scores={scores}
          sourcesConnected={sourcesConnected}
          interactive
        />
      </div>
    </section>
  );
}
