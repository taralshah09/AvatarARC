// ──────────────────────────────────────────────────────────────────────────────
// 2.1 — Normalization Curves
//
// Pure functions that map raw metric values to 0–99 integers using piecewise
// linear interpolation. No I/O, no side effects.
// ──────────────────────────────────────────────────────────────────────────────

/** [rawValue, score] */
export type Breakpoint = [number, number];

/**
 * Piecewise linear interpolation between breakpoints.
 * Breakpoints MUST be sorted ascending by raw value.
 * Values below the lowest breakpoint clamp to its score.
 * Values above the highest breakpoint clamp to its score.
 * Final output is always clamped to [0, 99].
 */
export function piecewiseScore(value: number, breakpoints: Breakpoint[]): number {
  if (breakpoints.length === 0) return 0;

  // Sort defensively (should already be sorted, but be safe)
  const sorted = [...breakpoints].sort((a, b) => a[0] - b[0]);

  // Below lowest breakpoint
  if (value <= sorted[0][0]) {
    return Math.max(0, Math.min(99, Math.round(sorted[0][1])));
  }

  // Above highest breakpoint
  if (value >= sorted[sorted.length - 1][0]) {
    return Math.max(0, Math.min(99, Math.round(sorted[sorted.length - 1][1])));
  }

  // Find surrounding breakpoints and interpolate
  for (let i = 0; i < sorted.length - 1; i++) {
    const [rawLow, scoreLow] = sorted[i];
    const [rawHigh, scoreHigh] = sorted[i + 1];

    if (value >= rawLow && value <= rawHigh) {
      const t = (value - rawLow) / (rawHigh - rawLow);
      const interpolated = scoreLow + t * (scoreHigh - scoreLow);
      return Math.max(0, Math.min(99, Math.round(interpolated)));
    }
  }

  // Fallback (should never reach here)
  return 0;
}

// ──────────────────────────────────────────────────────────────────────────────
// Breakpoint tables — one per metric
// ──────────────────────────────────────────────────────────────────────────────

// GitHub
export const COMMITS_365D_CURVE: Breakpoint[] = [
  [0, 0], [50, 40], [200, 70], [500, 85], [1000, 95],
];
export const CURRENT_STREAK_DAYS_CURVE: Breakpoint[] = [
  [0, 0], [7, 30], [30, 60], [90, 80], [180, 95],
];
export const REPOS_WITH_COMMITS_CURVE: Breakpoint[] = [
  [0, 0], [3, 30], [10, 60], [25, 80], [50, 95],
];
export const LANGUAGES_USED_CURVE: Breakpoint[] = [
  [0, 0], [2, 30], [5, 60], [8, 80], [12, 95],
];
export const PULL_REQUESTS_MERGED_365D_CURVE: Breakpoint[] = [
  [0, 0], [10, 40], [50, 70], [150, 85], [300, 95],
];

// Chess
export const RAPID_RATING_CURVE: Breakpoint[] = [
  [400, 0], [800, 30], [1200, 60], [1600, 80], [2000, 95],
];
export const BLITZ_RATING_CURVE: Breakpoint[] = [
  [400, 0], [800, 30], [1200, 60], [1600, 80], [2000, 95],
];
export const PUZZLE_RATING_CURVE: Breakpoint[] = [
  [400, 0], [900, 30], [1300, 60], [1700, 80], [2200, 95],
];
export const WIN_RATE_RAPID_CURVE: Breakpoint[] = [
  [0, 0], [40, 30], [50, 55], [60, 75], [70, 90],
];
export const GAMES_PLAYED_365D_CURVE: Breakpoint[] = [
  [0, 0], [50, 30], [200, 60], [500, 80], [1200, 95],
];
export const OPENINGS_PLAYED_CURVE: Breakpoint[] = [
  [0, 0], [3, 30], [8, 60], [15, 80], [25, 95],
];

// Strava / Fitness
export const TOTAL_DISTANCE_KM_365D_CURVE: Breakpoint[] = [
  [0, 0], [100, 30], [500, 60], [1500, 80], [3000, 95],
];
export const TOTAL_ACTIVITIES_365D_CURVE: Breakpoint[] = [
  [0, 0], [20, 30], [60, 60], [120, 80], [200, 95],
];
export const WORKOUT_STREAK_DAYS_CURVE: Breakpoint[] = [
  [0, 0], [5, 30], [14, 60], [30, 80], [60, 95],
];
export const WEEKLY_ACTIVITY_FREQUENCY_CURVE: Breakpoint[] = [
  [0, 0], [1, 30], [2, 55], [3, 75], [5, 95],
];

// Codeforces / Competitive
export const CF_RATING_CURVE: Breakpoint[] = [
  [0, 0], [1200, 30], [1600, 60], [2000, 80], [2400, 95],
];
export const PROBLEMS_SOLVED_365D_CURVE: Breakpoint[] = [
  [0, 0], [30, 30], [100, 60], [300, 80], [600, 95],
];
export const HARD_PROBLEMS_SOLVED_CURVE: Breakpoint[] = [
  [0, 0], [5, 30], [20, 60], [60, 80], [150, 95],
];
export const CONTEST_COUNT_365D_CURVE: Breakpoint[] = [
  [0, 0], [3, 30], [8, 60], [15, 80], [25, 95],
];

// ──────────────────────────────────────────────────────────────────────────────
// Curve registry — metric key → breakpoints
// ──────────────────────────────────────────────────────────────────────────────

const CURVE_REGISTRY: Record<string, Breakpoint[]> = {
  commits_365d: COMMITS_365D_CURVE,
  current_streak_days: CURRENT_STREAK_DAYS_CURVE,
  repos_with_commits: REPOS_WITH_COMMITS_CURVE,
  languages_used: LANGUAGES_USED_CURVE,
  pull_requests_merged_365d: PULL_REQUESTS_MERGED_365D_CURVE,
  rapid_rating: RAPID_RATING_CURVE,
  blitz_rating: BLITZ_RATING_CURVE,
  puzzle_rating: PUZZLE_RATING_CURVE,
  win_rate_rapid: WIN_RATE_RAPID_CURVE,
  games_played_365d: GAMES_PLAYED_365D_CURVE,
  openings_played: OPENINGS_PLAYED_CURVE,
  total_distance_km_365d: TOTAL_DISTANCE_KM_365D_CURVE,
  total_activities_365d: TOTAL_ACTIVITIES_365D_CURVE,
  workout_streak_days: WORKOUT_STREAK_DAYS_CURVE,
  weekly_activity_frequency: WEEKLY_ACTIVITY_FREQUENCY_CURVE,
  cf_rating: CF_RATING_CURVE,
  problems_solved_365d: PROBLEMS_SOLVED_365D_CURVE,
  hard_problems_solved: HARD_PROBLEMS_SOLVED_CURVE,
  contest_count_365d: CONTEST_COUNT_365D_CURVE,
};

/**
 * Score a metric by its key. Looks up the appropriate curve and interpolates.
 * Returns 0 if the metric key is unknown.
 */
export function scoreMetric(metricKey: string, value: number): number {
  const curve = CURVE_REGISTRY[metricKey];
  if (!curve) return 0;
  return piecewiseScore(value, curve);
}
