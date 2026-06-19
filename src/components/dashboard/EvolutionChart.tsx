'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ScoreSnapshot {
  vitality: number | null;
  discipline: number | null;
  logic: number | null;
  strategy: number | null;
  craft: number | null;
  grit: number | null;
  overall: number | null;
}

interface HistoryEntry {
  id: string;
  recordedAt: string;
  scoresSnapshot: ScoreSnapshot;
}

const AXES = [
  { key: 'vitality', label: 'Vitality', color: '#22c55e' },
  { key: 'discipline', label: 'Discipline', color: '#3b82f6' },
  { key: 'logic', label: 'Logic', color: '#a855f7' },
  { key: 'strategy', label: 'Strategy', color: '#f59e0b' },
  { key: 'craft', label: 'Craft', color: '#ec4899' },
  { key: 'grit', label: 'Grit', color: '#ef4444' },
] as const;

type AxisKey = (typeof AXES)[number]['key'];

export function EvolutionChart() {
  const [data, setData] = useState<Array<{
    date: string;
    vitality: number | null;
    discipline: number | null;
    logic: number | null;
    strategy: number | null;
    craft: number | null;
    grit: number | null;
  }>>([]);
  const [hidden, setHidden] = useState<Set<AxisKey>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/score/history')
      .then((r) => r.json())
      .then((entries: HistoryEntry[]) => {
        const sorted = [...entries].sort(
          (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );
        const rows = sorted.map((e) => ({
          date: new Date(e.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          vitality: e.scoresSnapshot.vitality,
          discipline: e.scoresSnapshot.discipline,
          logic: e.scoresSnapshot.logic,
          strategy: e.scoresSnapshot.strategy,
          craft: e.scoresSnapshot.craft,
          grit: e.scoresSnapshot.grit,
        }));
        setData(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(key: AxisKey) {
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm">
        Loading history…
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm text-center px-4">
        Check back after your next sync to see evolution.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {AXES.map(({ key, label, color }) => {
          const active = !hidden.has(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"
              style={{
                borderColor: active ? color : 'rgba(255,255,255,0.1)',
                color: active ? color : 'rgba(255,255,255,0.3)',
                background: active ? `${color}15` : 'transparent',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: active ? color : 'rgba(255,255,255,0.2)' }}
              />
              {label}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 99]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}
            itemStyle={{ fontSize: 12 }}
          />
          {AXES.map(({ key, label, color }) =>
            hidden.has(key) ? null : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
