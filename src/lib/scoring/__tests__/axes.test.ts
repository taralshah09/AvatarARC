import { describe, it, expect } from "vitest";
import {
  scoreVitality,
  scoreDiscipline,
  scoreLogic,
  scoreStrategy,
  scoreCraft,
  scoreGrit,
  calculateAllAxes,
  type SignalMap,
} from "../axes";

function makeSignals(entries: Record<string, number>): SignalMap {
  return new Map(Object.entries(entries));
}

describe("scoreVitality", () => {
  it("returns null when no vitality metrics are present", () => {
    expect(scoreVitality(makeSignals({ commits_365d: 200 }))).toBeNull();
  });

  it("scores with all metrics present", () => {
    const signals = makeSignals({
      total_distance_km_365d: 500,
      total_activities_365d: 60,
      workout_streak_days: 14,
      weekly_activity_frequency: 3,
    });
    const score = scoreVitality(signals);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(99);
  });

  it("scores with partial metrics (renormalized weights)", () => {
    const signals = makeSignals({ total_distance_km_365d: 1500 });
    const score = scoreVitality(signals);
    expect(score).toBe(80); // single metric = its own score
  });
});

describe("scoreDiscipline", () => {
  it("returns null when no discipline metrics exist", () => {
    expect(scoreDiscipline(makeSignals({}))).toBeNull();
  });

  it("averages available streak signals", () => {
    const signals = makeSignals({
      current_streak_days: 30,
      workout_streak_days: 14,
    });
    const score = scoreDiscipline(signals);
    expect(score).toBeGreaterThan(0);
    expect(score).not.toBeNull();
  });
});

describe("scoreLogic", () => {
  it("returns null for no logic signals", () => {
    expect(scoreLogic(makeSignals({}))).toBeNull();
  });

  it("scores with cf_rating and puzzle_rating", () => {
    const signals = makeSignals({ cf_rating: 1600, puzzle_rating: 1700 });
    const score = scoreLogic(signals);
    expect(score).toBeGreaterThanOrEqual(60);
  });
});

describe("scoreStrategy", () => {
  it("returns null for no strategy signals", () => {
    expect(scoreStrategy(makeSignals({}))).toBeNull();
  });

  it("scores chess-heavy user", () => {
    const signals = makeSignals({
      rapid_rating: 1600,
      win_rate_rapid: 55,
      openings_played: 10,
      blitz_rating: 1400,
    });
    const score = scoreStrategy(signals);
    expect(score).toBeGreaterThan(50);
  });
});

describe("scoreCraft", () => {
  it("returns null for no craft signals", () => {
    expect(scoreCraft(makeSignals({}))).toBeNull();
  });

  it("scores GitHub-active user", () => {
    const signals = makeSignals({
      commits_365d: 500,
      pull_requests_merged_365d: 50,
      repos_with_commits: 10,
      languages_used: 5,
    });
    const score = scoreCraft(signals);
    expect(score).toBeGreaterThan(60);
  });
});

describe("scoreGrit", () => {
  it("returns null for no grit signals", () => {
    expect(scoreGrit(makeSignals({}))).toBeNull();
  });

  it("scores with mixed long-haul signals", () => {
    const signals = makeSignals({
      current_streak_days: 90,
      hard_problems_solved: 60,
    });
    const score = scoreGrit(signals);
    expect(score).toBeGreaterThan(70);
  });
});

describe("calculateAllAxes", () => {
  it("returns null for all axes with empty signals", () => {
    const result = calculateAllAxes(new Map());
    expect(result.vitality).toBeNull();
    expect(result.discipline).toBeNull();
    expect(result.logic).toBeNull();
    expect(result.strategy).toBeNull();
    expect(result.craft).toBeNull();
    expect(result.grit).toBeNull();
  });

  it("populates only relevant axes", () => {
    const signals = makeSignals({ commits_365d: 200, languages_used: 5 });
    const result = calculateAllAxes(signals);
    expect(result.craft).not.toBeNull();
    expect(result.vitality).toBeNull();
    expect(result.strategy).toBeNull();
  });
});
