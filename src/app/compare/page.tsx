'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayerCard } from '@/components/card/PlayerCard';
import type { ScoreResult } from '@/lib/scoring';

interface UserData {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarConfig: unknown;
  score: {
    vitality: number | null;
    discipline: number | null;
    logic: number | null;
    strategy: number | null;
    craft: number | null;
    grit: number | null;
    overall: number | null;
    archetype: string | null;
    axesPopulated: number;
    xp: number;
    level: number;
  } | null;
}

const AXES = [
  { key: 'vitality' as const, label: 'Vitality' },
  { key: 'discipline' as const, label: 'Discipline' },
  { key: 'logic' as const, label: 'Logic' },
  { key: 'strategy' as const, label: 'Strategy' },
  { key: 'craft' as const, label: 'Craft' },
  { key: 'grit' as const, label: 'Grit' },
];

function toScoreResult(score: UserData['score']): ScoreResult | null {
  if (!score) return null;
  return {
    vitality: score.vitality,
    discipline: score.discipline,
    logic: score.logic,
    strategy: score.strategy,
    craft: score.craft,
    grit: score.grit,
    overall: score.overall,
    archetype: score.archetype,
    axesPopulated: score.axesPopulated,
    xp: score.xp,
    level: score.level,
  };
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-zinc-600">—</span>;
  if (delta === 0) return <span className="text-zinc-400">0</span>;
  const positive = delta > 0;
  return (
    <span className={positive ? 'text-green-400' : 'text-red-400'}>
      {positive ? '▲' : '▼'} {Math.abs(Math.round(delta))}
    </span>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inputB, setInputB] = useState(searchParams.get('b') ?? '');
  const [userA, setUserA] = useState<UserData | null>(null);
  const [userB, setUserB] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paramA = searchParams.get('a');
  const paramB = searchParams.get('b');

  const runCompare = useCallback(
    async (a: string, b: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? 'Not found');
          setUserA(null);
          setUserB(null);
        } else {
          setUserA(json.userA);
          setUserB(json.userB);
        }
      } catch {
        setError('Failed to fetch comparison');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (paramA && paramB) {
      setInputB(paramB);
      runCompare(paramA, paramB);
    }
  }, [paramA, paramB, runCompare]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paramA || !inputB.trim()) return;
    router.push(`/compare?a=${encodeURIComponent(paramA)}&b=${encodeURIComponent(inputB.trim())}`);
  }

  const scoreA = toScoreResult(userA?.score ?? null);
  const scoreB = toScoreResult(userB?.score ?? null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-lg">AvatarARC</Link>
        <Link href="/leaderboard" className="text-zinc-400 hover:text-white text-sm transition-colors">Leaderboard</Link>
        <span className="text-white text-sm font-medium">Compare</span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Compare</h1>
          <p className="text-zinc-400 mt-1 text-sm">See how you stack up against another player.</p>
        </div>

        {paramA ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <span className="text-zinc-300 font-semibold">{paramA}</span>
            <span className="text-zinc-500 text-sm">vs</span>
            <input
              type="text"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              placeholder="Enter username…"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-52"
            />
            <button
              type="submit"
              disabled={!inputB.trim() || loading}
              className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-40 transition-colors"
            >
              Compare
            </button>
          </form>
        ) : (
          <p className="text-zinc-500 text-sm">
            Sign in and visit your dashboard to compare yourself with others.
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {loading && (
          <p className="text-zinc-500 text-sm">Loading…</p>
        )}

        {userA && userB && scoreA && scoreB && (
          <>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <div className="flex flex-col items-center gap-2">
                <PlayerCard
                  user={{ username: userA.username, displayName: userA.displayName, avatarUrl: userA.avatarUrl, avatarConfig: userA.avatarConfig }}
                  scores={scoreA}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <PlayerCard
                  user={{ username: userB.username, displayName: userB.displayName, avatarUrl: userB.avatarUrl, avatarConfig: userB.avatarConfig }}
                  scores={scoreB}
                />
              </div>
            </div>

            <section>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Stat Comparison</h2>
              <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="text-left px-4 py-3 font-semibold">Axis</th>
                      <th className="text-center px-4 py-3 font-semibold">{userA.username}</th>
                      <th className="text-center px-4 py-3 font-semibold">{userB.username}</th>
                      <th className="text-center px-4 py-3 font-semibold">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ key: 'overall' as const, label: 'OVR' }, ...AXES].map(({ key, label }) => {
                      const vA = scoreA[key] as number | null;
                      const vB = scoreB[key] as number | null;
                      const delta = vA !== null && vB !== null ? vA - vB : null;
                      return (
                        <tr key={key} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
                          <td className="px-4 py-3 text-zinc-300 font-medium">{label}</td>
                          <td className="px-4 py-3 text-center text-white font-semibold">
                            {vA !== null ? Math.round(vA) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center text-white font-semibold">
                            {vB !== null ? Math.round(vB) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            <DeltaBadge delta={delta} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-zinc-500">Loading…</div>}>
      <CompareContent />
    </Suspense>
  );
}
