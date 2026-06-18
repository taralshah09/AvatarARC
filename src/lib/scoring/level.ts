// 2.4 — XP and Level System
import type { AxisScores } from "./axes";

/**
 * Calculate XP from overall score and populated axes count.
 * Base: OVR × axesPopulated × 1000
 * Bonuses: +2000 if all 6 axes; +1000 per axis ≥ 80
 */
export function calculateXP(
  axisScores: Partial<AxisScores>,
  ovr: number | null,
  axesPopulated: number
): number {
  if (ovr === null || axesPopulated === 0) return 0;

  let xp = ovr * axesPopulated * 1000;

  if (axesPopulated === 6) xp += 2000;

  for (const value of Object.values(axisScores)) {
    if (typeof value === "number" && value >= 80) xp += 1000;
  }

  return Math.round(xp);
}

/**
 * Level from XP. Level 1 at 0, Level 2 at 5000, capped at 99.
 */
export function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / 5000) + 1, 99);
}
