// 2.5 — Scoring Orchestrator
// Wires the pipeline: signals → axes → OVR → archetype → XP/level → persist
import { prisma } from "@/lib/db/client";
import { type SignalMap, calculateAllAxes, type AxisScores } from "./axes";
import { calculateOVR, countPopulatedAxes, determineArchetype } from "./overall";
import { calculateXP, calculateLevel } from "./level";

export interface ScoreResult {
  vitality: number | null;
  discipline: number | null;
  logic: number | null;
  strategy: number | null;
  craft: number | null;
  grit: number | null;
  overall: number | null;
  archetype: string | null;
  axesPopulated: number;
  xp: number;
  level: number;
}

/**
 * Query the signals table and build a map of metric → latest value per user.
 * For each (source, metric) pair, takes the most recent recordedAt value.
 */
export async function buildSignalMap(userId: string): Promise<SignalMap> {
  // Get distinct metrics with their latest values
  const signals = await prisma.signal.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
  });

  const map: SignalMap = new Map();

  for (const signal of signals) {
    // Only keep the first (most recent) value per metric
    if (!map.has(signal.metric)) {
      map.set(signal.metric, signal.value);
    }
  }

  return map;
}

/**
 * Full scoring pipeline: build signal map → calculate axes → OVR → archetype → XP/level.
 */
export async function calculateScores(userId: string): Promise<ScoreResult> {
  const signals = await buildSignalMap(userId);
  return calculateScoresFromMap(signals);
}

/**
 * Pure scoring from a signal map (useful for testing without DB).
 */
export function calculateScoresFromMap(signals: SignalMap): ScoreResult {
  const axisScores: AxisScores = calculateAllAxes(signals);
  const overall = calculateOVR(axisScores);
  const axesPopulated = countPopulatedAxes(axisScores);
  const archetype = determineArchetype(axisScores);
  const xp = calculateXP(axisScores, overall, axesPopulated);
  const level = calculateLevel(xp);

  return {
    vitality: axisScores.vitality,
    discipline: axisScores.discipline,
    logic: axisScores.logic,
    strategy: axisScores.strategy,
    craft: axisScores.craft,
    grit: axisScores.grit,
    overall,
    archetype,
    axesPopulated,
    xp,
    level,
  };
}

/**
 * Upsert scores table and append a score_history snapshot.
 */
export async function persistScores(
  userId: string,
  result: ScoreResult
): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.score.upsert({
      where: { userId },
      create: {
        userId,
        vitality: result.vitality,
        discipline: result.discipline,
        logic: result.logic,
        strategy: result.strategy,
        craft: result.craft,
        grit: result.grit,
        overall: result.overall,
        archetype: result.archetype,
        axesPopulated: result.axesPopulated,
        xp: result.xp,
        level: result.level,
        calculatedAt: now,
      },
      update: {
        vitality: result.vitality,
        discipline: result.discipline,
        logic: result.logic,
        strategy: result.strategy,
        craft: result.craft,
        grit: result.grit,
        overall: result.overall,
        archetype: result.archetype,
        axesPopulated: result.axesPopulated,
        xp: result.xp,
        level: result.level,
        calculatedAt: now,
      },
    }),
    prisma.scoreHistory.create({
      data: {
        userId,
        scoresSnapshot: result as unknown as object,
        recordedAt: now,
      },
    }),
  ]);
}
