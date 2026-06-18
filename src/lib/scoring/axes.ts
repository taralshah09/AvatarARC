// ──────────────────────────────────────────────────────────────────────────────
// 2.2 — Axis Calculators
//
// One pure function per axis. Each reads from a SignalMap (metric key → raw
// value), applies normalization curves, blends via weighted mean, and returns
// 0–99 or null if no data exists.
// ──────────────────────────────────────────────────────────────────────────────

import { scoreMetric } from "./curves";

/** metric key → latest raw value */
export type SignalMap = Map<string, number>;

/** All six axis names */
export type AxisName = "vitality" | "discipline" | "logic" | "strategy" | "craft" | "grit";

/** All axis scores (each can be null if no signals for that axis) */
export type AxisScores = Record<AxisName, number | null>;

/** Weight definition: [metricKey, weight] */
type WeightedMetric = [string, number];

/**
 * Generic weighted-mean calculator.
 * Skips metrics that aren't present in the signal map.
 * Renormalizes weights so they sum to 1 using only the present metrics.
 * Returns null if zero metrics are present.
 */
function weightedAxisScore(
  signals: SignalMap,
  metrics: WeightedMetric[]
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [metricKey, weight] of metrics) {
    const rawValue = signals.get(metricKey);
    if (rawValue === undefined) continue;

    const scored = scoreMetric(metricKey, rawValue);
    weightedSum += scored * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  return Math.round(weightedSum / totalWeight);
}

// ──────────────────────────────────────────────────────────────────────────────
// Individual axis functions
// ──────────────────────────────────────────────────────────────────────────────

/** Vitality — Strava fitness signals */
export function scoreVitality(signals: SignalMap): number | null {
  return weightedAxisScore(signals, [
    ["total_distance_km_365d", 0.30],
    ["total_activities_365d", 0.25],
    ["workout_streak_days", 0.25],
    ["weekly_activity_frequency", 0.20],
  ]);
}

/** Discipline — cross-source streak consistency */
export function scoreDiscipline(signals: SignalMap): number | null {
  return weightedAxisScore(signals, [
    ["current_streak_days", 1],
    ["workout_streak_days", 1],
    ["games_played_365d", 1],
  ]);
}

/** Logic — competitive programming + chess puzzles */
export function scoreLogic(signals: SignalMap): number | null {
  return weightedAxisScore(signals, [
    ["cf_rating", 0.40],
    ["hard_problems_solved", 0.35],
    ["puzzle_rating", 0.25],
  ]);
}

/** Strategy — chess ratings and strategic breadth */
export function scoreStrategy(signals: SignalMap): number | null {
  return weightedAxisScore(signals, [
    ["rapid_rating", 0.40],
    ["win_rate_rapid", 0.30],
    ["openings_played", 0.20],
    ["blitz_rating", 0.10],
  ]);
}

/** Craft — GitHub development activity */
export function scoreCraft(signals: SignalMap): number | null {
  return weightedAxisScore(signals, [
    ["commits_365d", 0.35],
    ["pull_requests_merged_365d", 0.25],
    ["repos_with_commits", 0.20],
    ["languages_used", 0.20],
  ]);
}

/** Grit — long-haul sustained effort across domains */
export function scoreGrit(signals: SignalMap): number | null {
  return weightedAxisScore(signals, [
    ["current_streak_days", 1],
    ["workout_streak_days", 1],
    ["contest_count_365d", 1],
    ["hard_problems_solved", 1],
  ]);
}

// ──────────────────────────────────────────────────────────────────────────────
// Convenience: calculate all axes at once
// ──────────────────────────────────────────────────────────────────────────────

const AXIS_CALCULATORS: Record<AxisName, (signals: SignalMap) => number | null> = {
  vitality: scoreVitality,
  discipline: scoreDiscipline,
  logic: scoreLogic,
  strategy: scoreStrategy,
  craft: scoreCraft,
  grit: scoreGrit,
};

export const AXIS_NAMES: AxisName[] = [
  "vitality", "discipline", "logic", "strategy", "craft", "grit",
];

/**
 * Run all six axis calculators and return the results.
 */
export function calculateAllAxes(signals: SignalMap): AxisScores {
  const result = {} as AxisScores;
  for (const axis of AXIS_NAMES) {
    result[axis] = AXIS_CALCULATORS[axis](signals);
  }
  return result;
}
