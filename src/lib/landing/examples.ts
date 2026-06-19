import type { ScoreResult } from '@/lib/scoring';

export interface ExampleCard {
  user: {
    username: string;
    displayName: string;
    avatarUrl: null;
    avatarConfig: null;
  };
  scores: ScoreResult;
  sourcesConnected: number;
}

export const EXAMPLE_CARDS: ExampleCard[] = [
  {
    user: {
      username: 'alex_dev',
      displayName: 'Alex Chen',
      avatarUrl: null,
      avatarConfig: null,
    },
    scores: {
      vitality: null,
      discipline: 62,
      logic: null,
      strategy: null,
      craft: 71,
      grit: 58,
      overall: 63.7,
      archetype: 'Maker',
      axesPopulated: 3,
      xp: 1240,
      level: 11,
    },
    sourcesConnected: 2,
  },
  {
    user: {
      username: 'chess_master',
      displayName: 'Priya R.',
      avatarUrl: null,
      avatarConfig: null,
    },
    scores: {
      vitality: 68,
      discipline: 79,
      logic: 83,
      strategy: 81,
      craft: 74,
      grit: 72,
      overall: 76.2,
      archetype: 'Tactician',
      axesPopulated: 6,
      xp: 3810,
      level: 19,
    },
    sourcesConnected: 4,
  },
  {
    user: {
      username: 'ultra_runner',
      displayName: 'Marco T.',
      avatarUrl: null,
      avatarConfig: null,
    },
    scores: {
      vitality: 94,
      discipline: 91,
      logic: 72,
      strategy: 69,
      craft: 88,
      grit: 96,
      overall: 85.0,
      archetype: 'Ironforge',
      axesPopulated: 6,
      xp: 7200,
      level: 28,
    },
    sourcesConnected: 5,
  },
];
