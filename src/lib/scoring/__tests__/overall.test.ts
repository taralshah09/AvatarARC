import { describe, it, expect } from "vitest";
import { calculateOVR, countPopulatedAxes, determineArchetype } from "../overall";
import { calculateXP, calculateLevel } from "../level";
import type { AxisScores } from "../axes";

function fullScores(overrides: Partial<AxisScores> = {}): AxisScores {
  return {
    vitality: 70,
    discipline: 65,
    logic: 80,
    strategy: 75,
    craft: 85,
    grit: 60,
    ...overrides,
  };
}

describe("calculateOVR", () => {
  it("returns null when all axes are null", () => {
    expect(calculateOVR({
      vitality: null, discipline: null, logic: null,
      strategy: null, craft: null, grit: null,
    })).toBeNull();
  });

  it("returns the score when only one axis is populated", () => {
    expect(calculateOVR({ craft: 80 })).toBe(80);
  });

  it("returns mean of all non-null axes", () => {
    const scores = fullScores();
    const expected = Math.round((70 + 65 + 80 + 75 + 85 + 60) / 6);
    expect(calculateOVR(scores)).toBe(expected);
  });

  it("ignores null axes in mean", () => {
    const result = calculateOVR({ vitality: 80, craft: 60, logic: null });
    expect(result).toBe(70); // (80+60)/2
  });
});

describe("countPopulatedAxes", () => {
  it("counts 0 for empty scores", () => {
    expect(countPopulatedAxes({})).toBe(0);
  });

  it("counts only non-null axes", () => {
    expect(countPopulatedAxes({ vitality: 50, craft: null, logic: 70 })).toBe(2);
  });

  it("counts all 6 for full scores", () => {
    expect(countPopulatedAxes(fullScores())).toBe(6);
  });
});

describe("determineArchetype", () => {
  it("returns null for no axes", () => {
    expect(determineArchetype({})).toBeNull();
  });

  it('returns "The Builder" for Craft + Discipline top 2', () => {
    expect(determineArchetype({ craft: 90, discipline: 85, logic: 30 })).toBe("The Builder");
  });

  it('returns "Mind Player" for Logic + Strategy', () => {
    expect(determineArchetype({ logic: 95, strategy: 90, vitality: 20 })).toBe("Mind Player");
  });

  it('returns "Chess Machine" for Strategy + Logic (reversed order)', () => {
    expect(determineArchetype({ strategy: 95, logic: 90, craft: 20 })).toBe("Chess Machine");
  });

  it('returns "Code Warrior" for Craft + Grit', () => {
    expect(determineArchetype({ craft: 88, grit: 85, discipline: 10 })).toBe("Code Warrior");
  });

  it('returns "Iron Athlete" for Vitality + Grit', () => {
    expect(determineArchetype({ vitality: 90, grit: 88, logic: 10 })).toBe("Iron Athlete");
  });

  it('returns "Consistent Force" for Discipline + any unmatched axis', () => {
    expect(determineArchetype({ discipline: 90, vitality: 85, logic: 10 })).toBe("Consistent Force");
  });

  it('returns "The Allrounder" for even scores', () => {
    expect(determineArchetype({
      vitality: 70, discipline: 72, logic: 71,
      strategy: 73, craft: 69, grit: 70,
    })).toBe("The Allrounder");
  });

  it('returns "Strategist Athlete" for Strategy + Vitality', () => {
    expect(determineArchetype({ strategy: 90, vitality: 85, logic: 10 })).toBe("Strategist Athlete");
  });
});

describe("calculateXP", () => {
  it("returns 0 when OVR is null", () => {
    expect(calculateXP({}, null, 0)).toBe(0);
  });

  it("calculates base XP correctly", () => {
    // OVR 50 × 2 axes × 1000 = 100,000
    expect(calculateXP({ craft: 50, logic: 50 }, 50, 2)).toBe(100000);
  });

  it("adds completionist bonus for 6 axes", () => {
    const scores = fullScores();
    const ovr = Math.round((70 + 65 + 80 + 75 + 85 + 60) / 6); // 73
    const xp = calculateXP(scores, ovr, 6);
    // Base: 73 × 6 × 1000 = 438000
    // Completionist: +2000
    // Elite (80+): logic(80), craft(85) = +2000
    expect(xp).toBe(438000 + 2000 + 2000);
  });
});

describe("calculateLevel", () => {
  it("returns level 1 at 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 2 at 5000 XP", () => {
    expect(calculateLevel(5000)).toBe(2);
  });

  it("caps at level 99", () => {
    expect(calculateLevel(999999)).toBe(99);
  });

  it("returns correct level for mid-range XP", () => {
    expect(calculateLevel(24999)).toBe(5); // floor(24999/5000)+1 = 5
    expect(calculateLevel(25000)).toBe(6);
  });
});
