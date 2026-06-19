'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerCard } from '@/components/card/PlayerCard';
import type { ScoreResult } from '@/lib/scoring';
import type { AvatarConfig2D } from '@/components/avatar/Avatar2D';

interface OnboardingCardStepProps {
  username: string | null;
  user: {
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    avatarConfig?: AvatarConfig2D;
  };
  scores: ScoreResult | null;
}

export function OnboardingCardStep({ username, user, scores }: OnboardingCardStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!username) return;
    const url = `${window.location.origin}/card/${username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {scores && username ? (
        <PlayerCard user={user} scores={scores} interactive />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center w-full max-w-[360px]">
          <p className="text-zinc-400 text-sm">
            No scores yet — sync your platforms on the dashboard to generate your card.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-[360px]">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 text-white
            hover:bg-blue-500 active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Go to Dashboard'}
        </button>
        {username && scores && (
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-zinc-700
              text-zinc-300 hover:text-white hover:border-zinc-500 transition-all duration-200"
          >
            {copied ? 'Copied!' : 'Copy Card Link'}
          </button>
        )}
      </div>
    </div>
  );
}
