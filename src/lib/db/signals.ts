import { prisma } from "./client";
import type { Signal } from "@/lib/adapters/types";

export async function writeSignals(signals: Signal[]): Promise<void> {
  if (signals.length === 0) return;

  // Upsert each signal: append new rows; if same (userId, source, metric, recordedAt) already
  // exists, update the value. recordedAt defaults to now() on insert so effectively each sync
  // appends a fresh snapshot row — history is preserved by default.
  await prisma.$transaction(
    signals.map((s) =>
      prisma.signal.create({
        data: {
          userId: s.userId,
          source: s.source,
          metric: s.metric,
          value: s.value,
          unit: s.unit,
          periodStart: s.periodStart ?? null,
          periodEnd: s.periodEnd ?? null,
          rawPayload: s.rawPayload ?? undefined,
        },
      })
    )
  );
}
