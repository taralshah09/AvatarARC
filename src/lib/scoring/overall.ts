// ──────────────────────────────────────────────────────────────────────────────
// 2.3 — OVR + Archetype Logic
//
// Pure functions to compute the Overall Rating (mean of populated axes) and
// assign a human-readable archetype label based on top-2 dominant axes.
// ──────────────────────────────────────────────────────────────────────────────

import { type AxisName, type AxisScores, AXIS_NAMES } from "./axes";

// ──────────────────────────────────────────────────────────────────────────────
// OVR
// ──────────────────────────────────────────────────────────────────────────────

/**
 * OVR = rounded mean of all non-null axis scores.
 * Returns null if zero axes are populated.
 */
export function calculateOVR(axisScores: Partial<AxisScores>): number | null {
  const values: number[] = [];

  for (const axis of AXIS_NAMES) {
    const v = axisScores[axis];
    if (v !== null && v !== undefined) {
      values.push(v);
    }
  }

  if (values.length === 0) return null;

  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round(sum / values.length);
}

/**
 * Count how many axes have a non-null score.
 */
export function countPopulatedAxes(axisScores: Partial<AxisScores>): number {
  let count = 0;
  for (const axis of AXIS_NAMES) {
    if (axisScores[axis] !== null && axisScores[axis] !== undefined) {
      count++;
    }
  }
  return count;
}

// ──────────────────────────────────────────────────────────────────────────────
// Archetype
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Archetype lookup: ordered pair [dominantAxis, secondAxis] → label.
 * Order matters: Logic+Strategy = "Mind Player", Strategy+Logic = "Chess Machine".
 */
const ARCHETYPE_TABLE: Array<{ top1: AxisName; top2: AxisName; label: string }> = [
  { top1: "strategy", top2: "vitality", label: "Strategist Athlete" },
  { top1: "vitality", top2: "strategy", label: "Strategist Athlete" },
  { top1: "craft", top2: "discipline", label: "The Builder" },
  { top1: "discipline", top2: "craft", label: "The Builder" },
  { top1: "grit", top2: "discipline", label: "The Grinder" },
  { top1: "discipline", top2: "grit", label: "The Grinder" },
  { top1: "logic", top2: "strategy", label: "Mind Player" },
  { top1: "strategy", top2: "logic", label: "Chess Machine" },
  { top1: "craft", top2: "grit", label: "Code Warrior" },
  { top1: "grit", top2: "craft", label: "Code Warrior" },
  { top1: "logic", top2: "craft", label: "The Scholar" },
  { top1: "craft", top2: "logic", label: "The Scholar" },
  { top1: "vitality", top2: "grit", label: "Iron Athlete" },
  { top1: "grit", top2: "vitality", label: "Iron Athlete" },
];

/**
 * Check if all populated axes are within 10 points of each other.
 */
function isAllrounder(axisScores: Partial<AxisScores>): boolean {
  const values: number[] = [];
  for (const axis of AXIS_NAMES) {
    const v = axisScores[axis];
    if (v !== null && v !== undefined) values.push(v);
  }
  if (values.length < 3) return false;

  const min = Math.min(...values);
  const max = Math.max(...values);
  return (max - min) <= 10;
}

/**
 * Determine archetype from the top-2 dominant axes.
 *
 * Algorithm:
 * 1. Sort non-null axis scores descending.
 * 2. Check for "Allrounder" first (all within 10 points).
 * 3. Take top-2 axis names (order matters).
 * 4. Look up (top1, top2) in the archetype table.
 * 5. If top axis is Discipline and no specific match, return "Consistent Force".
 * 6. Fallback to "The Allrounder" if no match.
 */
export function determineArchetype(axisScores: Partial<AxisScores>): string | null {
  const entries: Array<{ axis: AxisName; score: number }> = [];

  for (const axis of AXIS_NAMES) {
    const v = axisScores[axis];
    if (v !== null && v !== undefined) {
      entries.push({ axis, score: v });
    }
  }

  if (entries.length === 0) return null;

  // Check allrounder first
  if (isAllrounder(axisScores)) {
    return "The Allrounder";
  }

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);

  if (entries.length === 1) {
    return entries[0].axis === "discipline" ? "Consistent Force" : null;
  }

  const top1 = entries[0].axis;
  const top2 = entries[1].axis;

  // Check archetype table (order-sensitive)
  for (const entry of ARCHETYPE_TABLE) {
    if (entry.top1 === top1 && entry.top2 === top2) {
      return entry.label;
    }
  }

  // "Consistent Force" — Discipline + any
  if (top1 === "discipline" || top2 === "discipline") {
    return "Consistent Force";
  }

  // No match found
  return "The Allrounder";
}

