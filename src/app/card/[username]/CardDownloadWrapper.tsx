'use client';

import { useRef } from 'react';
import { PlayerCard } from '@/components/card/PlayerCard';
import { DownloadButton } from '@/components/card/DownloadButton';
import type { ScoreResult } from '@/lib/scoring';

interface CardDownloadWrapperProps {
  user: {
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    avatarConfig?: unknown;
  };
  scores: ScoreResult;
  sourcesConnected: number;
}

export function CardDownloadWrapper({ user, scores, sourcesConnected }: CardDownloadWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <PlayerCard
        ref={cardRef}
        user={user}
        scores={scores}
        sourcesConnected={sourcesConnected}
        interactive
      />
      <DownloadButton cardRef={cardRef} username={user.username} />
    </div>
  );
}
