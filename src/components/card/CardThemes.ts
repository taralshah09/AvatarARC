export type CardTheme = {
  bg: string;
  accent: string;
  borderClass: string;
  glowClass: string;
  radarFill: string;
  radarStroke: string;
};

export const THEMES: Record<'standard' | 'rare' | 'legendary', CardTheme> = {
  standard: {
    bg: '#0f172a',
    accent: '#3b82f6',
    borderClass: 'border-slate-700',
    glowClass: '',
    radarFill: 'rgba(59, 130, 246, 0.4)',
    radarStroke: '#3b82f6',
  },
  rare: {
    bg: '#1e1b4b',
    accent: '#8b5cf6',
    borderClass: 'border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    glowClass: 'drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]',
    radarFill: 'rgba(139, 92, 246, 0.4)',
    radarStroke: '#8b5cf6',
  },
  legendary: {
    bg: '#1a1408',
    accent: '#f59e0b',
    borderClass: 'border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.4)]',
    glowClass: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]',
    radarFill: 'rgba(245, 158, 11, 0.4)',
    radarStroke: '#f59e0b',
  }
};

export function getTheme(ovr: number | null): CardTheme {
  if (ovr === null) return THEMES.standard;
  if (ovr >= 85) return THEMES.legendary;
  if (ovr >= 70) return THEMES.rare;
  return THEMES.standard;
}

export function getThemeName(ovr: number | null): 'standard' | 'rare' | 'legendary' {
  if (ovr === null) return 'standard';
  if (ovr >= 85) return 'legendary';
  if (ovr >= 70) return 'rare';
  return 'standard';
}
