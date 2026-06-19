'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar2D } from '@/components/avatar/Avatar2D';
import type { AvatarConfig2D } from '@/components/avatar/Avatar2D';

interface LeaderboardRow {
  rank: number;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  avatarConfig: unknown;
  score: number;
}

const TABS = [
  { key: 'overall', label: 'Overall' },
  { key: 'vitality', label: 'Vitality' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'logic', label: 'Logic' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'craft', label: 'Craft' },
  { key: 'grit', label: 'Grit' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function AvatarCell({ row }: { row: LeaderboardRow }) {
  const config = row.avatarConfig as Record<string, unknown> | null;
  if (config?.type === '2d') {
    return (
      <Avatar2D
        config={config as unknown as AvatarConfig2D}
        size={36}
        seed={row.username ?? 'unknown'}
      />
    );
  }
  const name = row.displayName ?? row.username ?? '?';
  return (
    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300">
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overall');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.username) setCurrentUsername(data.username); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?axis=${activeTab}`)
      .then((r) => r.json())
      .then((data) => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-lg">AvatarARC</Link>
        <span className="text-white text-sm font-medium">Leaderboard</span>
        <Link href="/compare" className="text-zinc-400 hover:text-white text-sm transition-colors">Compare</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-zinc-400 mt-1 text-sm">Top players by score axis.</p>
        </div>

        <div className="flex gap-1 flex-wrap">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === key
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-zinc-500 text-sm py-8 text-center">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-zinc-500 text-sm py-8 text-center">No players yet.</div>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {rows.map((row) => {
              const isMe = row.username && row.username === currentUsername;
              const displayName = row.displayName ?? row.username ?? 'Unknown';
              return (
                <div
                  key={row.username ?? row.rank}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50 last:border-0 transition-colors ${
                    isMe ? 'bg-blue-950/30' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <span
                    className={`w-7 text-right text-sm font-bold shrink-0 ${
                      row.rank === 1 ? 'text-amber-400' : row.rank <= 3 ? 'text-zinc-300' : 'text-zinc-600'
                    }`}
                  >
                    {row.rank}
                  </span>

                  <AvatarCell row={row} />

                  <div className="flex-1 min-w-0">
                    {row.username ? (
                      <Link
                        href={`/card/${row.username}`}
                        className="font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                      >
                        {displayName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white truncate block">{displayName}</span>
                    )}
                    {row.username && (
                      <span className="text-xs text-zinc-500">@{row.username}</span>
                    )}
                  </div>

                  {isMe && (
                    <span className="text-xs text-blue-400 font-semibold shrink-0">You</span>
                  )}

                  <span className="text-lg font-black text-white shrink-0 tabular-nums">
                    {Math.round(row.score)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
