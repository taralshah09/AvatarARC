'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreToastContainer, type Toast } from '@/components/notifications/ScoreToast';
import type { ScoreResult } from '@/lib/scoring';

const AXIS_LABELS: Record<string, string> = {
  vitality: 'Vitality',
  discipline: 'Discipline',
  logic: 'Logic',
  strategy: 'Strategy',
  craft: 'Craft',
  grit: 'Grit',
};

function buildToasts(prev: ScoreResult | null, next: ScoreResult): Toast[] {
  const toasts: Toast[] = [];
  const axes = ['vitality', 'discipline', 'logic', 'strategy', 'craft', 'grit'] as const;

  if (prev && next.level > prev.level) {
    toasts.push({
      id: 'level',
      message: `You reached Level ${next.level}!`,
      type: 'level',
    });
  }

  for (const axis of axes) {
    const prevVal = prev?.[axis] ?? null;
    const nextVal = next[axis] ?? null;
    if (prevVal === null || nextVal === null) continue;
    const delta = nextVal - prevVal;
    if (Math.abs(delta) < 2) continue;

    const label = AXIS_LABELS[axis];
    toasts.push({
      id: axis,
      message:
        delta > 0
          ? `${label} went up! ${Math.round(prevVal)} → ${Math.round(nextVal)} ▲`
          : `${label} dipped. ${Math.round(prevVal)} → ${Math.round(nextVal)} ▼`,
      type: delta > 0 ? 'improvement' : 'drop',
    });
  }

  return toasts;
}

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const prevRes = await fetch('/api/score/me');
      const prevScore: ScoreResult | null = prevRes.ok ? ((await prevRes.json()) as ScoreResult) : null;

      await fetch('/api/sync/all', { method: 'POST' });

      const nextRes = await fetch('/api/score/me');
      if (nextRes.ok) {
        const nextScore = (await nextRes.json()) as ScoreResult;
        const newToasts = buildToasts(prevScore, nextScore);
        if (newToasts.length > 0) {
          setToasts(newToasts);
        }
      }

      router.refresh();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
          bg-zinc-800 border border-zinc-700 text-zinc-300
          hover:bg-zinc-700 hover:text-white hover:border-zinc-500
          disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {syncing ? 'Syncing…' : 'Sync Now'}
      </button>
      <ScoreToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
