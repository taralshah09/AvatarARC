import { describe, it, expect } from "vitest";
import {
  piecewiseScore,
  scoreMetric,
  COMMITS_365D_CURVE,
  RAPID_RATING_CURVE,
  PUZZLE_RATING_CURVE,
  WIN_RATE_RAPID_CURVE,
} from "../curves";

describe("piecewiseScore", () => {
  const SIMPLE_CURVE: [number, number][] = [
    [0, 0], [100, 50], [200, 99],
  ];

  it("returns low-end clamp when value is below first breakpoint", () => {
    expect(piecewiseScore(-10, SIMPLE_CURVE)).toBe(0);
  });

  it("returns exact score at a breakpoint", () => {
    expect(piecewiseScore(0, SIMPLE_CURVE)).toBe(0);
    expect(piecewiseScore(100, SIMPLE_CURVE)).toBe(50);
    expect(piecewiseScore(200, SIMPLE_CURVE)).toBe(99);
  });

  it("interpolates between breakpoints", () => {
    // Midpoint between [0,0] and [100,50] → 50 raw → score 25
    expect(piecewiseScore(50, SIMPLE_CURVE)).toBe(25);
  });

  it("clamps at high end when value exceeds last breakpoint", () => {
    expect(piecewiseScore(500, SIMPLE_CURVE)).toBe(99);
  });

  it("clamps output to [0, 99] range", () => {
    const weirdCurve: [number, number][] = [[0, -10], [100, 120]];
    expect(piecewiseScore(0, weirdCurve)).toBe(0);    // clamped from -10
    expect(piecewiseScore(100, weirdCurve)).toBe(99);  // clamped from 120
  });

  it("returns 0 for empty breakpoints", () => {
    expect(piecewiseScore(50, [])).toBe(0);
  });

  it("handles single breakpoint", () => {
    expect(piecewiseScore(50, [[10, 40]])).toBe(40);
  });
});

describe("scoreMetric", () => {
  it("scores commits_365d correctly", () => {
    expect(scoreMetric("commits_365d", 0)).toBe(0);
    expect(scoreMetric("commits_365d", 50)).toBe(40);
    expect(scoreMetric("commits_365d", 125)).toBe(55); // interpolated
    expect(scoreMetric("commits_365d", 1000)).toBe(95);
    expect(scoreMetric("commits_365d", 5000)).toBe(95); // clamped
  });

  it("scores rapid_rating correctly", () => {
    expect(scoreMetric("rapid_rating", 400)).toBe(0);
    expect(scoreMetric("rapid_rating", 1000)).toBe(45); // interpolated
    expect(scoreMetric("rapid_rating", 2000)).toBe(95);
  });

  it("scores puzzle_rating correctly", () => {
    expect(scoreMetric("puzzle_rating", 400)).toBe(0);
    expect(scoreMetric("puzzle_rating", 2200)).toBe(95);
  });

  it("scores win_rate_rapid correctly", () => {
    expect(scoreMetric("win_rate_rapid", 50)).toBe(55);
    expect(scoreMetric("win_rate_rapid", 0)).toBe(0);
  });

  it("returns 0 for unknown metric keys", () => {
    expect(scoreMetric("unknown_metric", 100)).toBe(0);
  });
});

describe("breakpoint curve shapes", () => {
  it("all defined curves are monotonically increasing in score", () => {
    const curves = [COMMITS_365D_CURVE, RAPID_RATING_CURVE, PUZZLE_RATING_CURVE, WIN_RATE_RAPID_CURVE];
    for (const curve of curves) {
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i][1]).toBeGreaterThanOrEqual(curve[i - 1][1]);
      }
    }
  });
});
