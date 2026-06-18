'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { RadarHexagon } from './RadarHexagon';
import { THEMES, getThemeName } from './CardThemes';
import { Avatar2D } from '@/components/avatar/Avatar2D';
import type { AvatarConfig2D } from '@/components/avatar/Avatar2D';
import type { ScoreResult } from '@/lib/scoring';

interface PlayerCardUser {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  avatarConfig?: unknown;
}

interface PlayerCardProps {
  user: PlayerCardUser;
  scores: ScoreResult;
  theme?: 'standard' | 'rare' | 'legendary';
  interactive?: boolean;
  sourcesConnected?: number;
}

const AXES = [
  { key: 'VIT' as const, getVal: (s: ScoreResult) => s.vitality },
  { key: 'STR' as const, getVal: (s: ScoreResult) => s.strategy },
  { key: 'CRA' as const, getVal: (s: ScoreResult) => s.craft },
  { key: 'GRT' as const, getVal: (s: ScoreResult) => s.grit },
  { key: 'DIS' as const, getVal: (s: ScoreResult) => s.discipline },
  { key: 'LOG' as const, getVal: (s: ScoreResult) => s.logic },
];

export const PlayerCard = forwardRef<HTMLDivElement, PlayerCardProps>(
  ({ user, scores, theme: themeProp, interactive = false, sourcesConnected = 0 }, ref) => {
    const themeName = themeProp ?? getThemeName(scores.overall);
    const theme = THEMES[themeName];

    const radarScores = {
      VIT: scores.vitality ?? undefined,
      STR: scores.strategy ?? undefined,
      CRA: scores.craft ?? undefined,
      GRT: scores.grit ?? undefined,
      DIS: scores.discipline ?? undefined,
      LOG: scores.logic ?? undefined,
    };

    const displayName = user.displayName ?? user.username;

    const card = (
      <div
        className={`relative w-[360px] rounded-2xl overflow-hidden border-2 ${theme.borderClass}`}
        style={{ background: theme.bg }}
      >
        {/* Ambient glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}22 0%, transparent 60%)`,
          }}
        />

        {/* Corner accents */}
        {['top-0 left-0 border-t-2 border-l-2 rounded-tl-xl', 'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl', 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl', 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl'].map((cls, i) => (
          <div key={i} className={`absolute ${cls} w-5 h-5 m-2 pointer-events-none opacity-60`} style={{ borderColor: theme.accent }} />
        ))}

        <div className="relative z-10 p-5 flex flex-col items-center gap-4">
          {/* Header */}
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
              AvatarARC
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider"
              style={{ color: theme.accent, borderColor: `${theme.accent}55` }}
            >
              {themeName}
            </span>
          </div>

          {/* Avatar */}
          <div className="rounded-xl overflow-hidden" style={{ border: `2px solid ${theme.accent}70` }}>
            {user.avatarConfig && (user.avatarConfig as Record<string, unknown>).type === '2d' ? (
              <Avatar2D
                config={user.avatarConfig as AvatarConfig2D}
                size={96}
                seed={user.username}
              />
            ) : (
              <div
                className="w-24 h-32 flex items-center justify-center text-3xl font-black select-none"
                style={{
                  background: `${theme.accent}18`,
                  color: theme.accent,
                }}
              >
                {displayName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + OVR */}
          <div className="text-center">
            <div className="text-xl font-black text-white uppercase tracking-wide leading-tight">
              {displayName}
            </div>
            <div className="flex items-baseline justify-center gap-1.5 mt-1">
              <span className="text-xs text-slate-400 uppercase tracking-widest">OVR</span>
              <span className="text-3xl font-black leading-none" style={{ color: theme.accent }}>
                {scores.overall !== null ? Math.round(scores.overall) : '–'}
              </span>
            </div>
          </div>

          {/* Radar hexagon */}
          <div className="relative w-[220px] h-[220px] flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)` }}
            />
            <RadarHexagon scores={radarScores} size={220} themeName={themeName} />
          </div>

          {/* Axis stat grid */}
          <div className="w-full grid grid-cols-3 gap-x-4 gap-y-1 text-center">
            {AXES.map(({ key, getVal }) => {
              const val = getVal(scores);
              return (
                <div key={key} className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{key}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: val !== null ? 'white' : 'rgba(255,255,255,0.2)' }}
                  >
                    {val !== null ? Math.round(val) : '–'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer: archetype / level / sources */}
          <div className="w-full border-t border-white/10 pt-3 grid grid-cols-3 text-center gap-2">
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Archetype</span>
              <span className="text-xs text-white font-semibold leading-tight">{scores.archetype ?? 'Novice'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Level</span>
              <span className="text-sm font-black" style={{ color: theme.accent }}>
                Lv.{scores.level}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Sources</span>
              <span className="text-xs text-white font-semibold">{sourcesConnected}/6</span>
            </div>
          </div>
        </div>
      </div>
    );

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {card}
        </motion.div>
      );
    }

    return <div ref={ref}>{card}</div>;
  }
);

PlayerCard.displayName = 'PlayerCard';
