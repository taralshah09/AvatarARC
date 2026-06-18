import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { decrypt } from "@/lib/utils/encryption";
import { adapterRegistry } from "@/lib/adapters/registry";
import { writeSignals } from "@/lib/db/signals";
import { calculateScores, persistScores } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const isCron = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

  let userIdFilter: string | undefined;

  if (!isCron) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userIdFilter = user.id;
  }

  const connections = await prisma.connectedProvider.findMany({
    where: {
      syncStatus: { not: "syncing" },
      ...(userIdFilter ? { userId: userIdFilter } : {}),
    },
  });

  const results: Array<{ userId: string; provider: string; status: string }> = [];

  for (const conn of connections) {
    const adapter = adapterRegistry[conn.provider];
    if (!adapter) continue;

    await prisma.connectedProvider.update({
      where: { id: conn.id },
      data: { syncStatus: "syncing" },
    });

    try {
      const accessToken =
        conn.accessToken === "public"
          ? conn.providerUserId
          : decrypt(conn.accessToken!);

      const signals = await adapter.fetchSignals(conn.userId, accessToken);
      await writeSignals(signals);

      await prisma.connectedProvider.update({
        where: { id: conn.id },
        data: { syncStatus: "idle", lastSyncedAt: new Date() },
      });

      results.push({ userId: conn.userId, provider: conn.provider, status: "ok" });
    } catch (err) {
      await prisma.connectedProvider.update({
        where: { id: conn.id },
        data: { syncStatus: "error" },
      });
      console.error(`Cron sync failed ${conn.provider} for ${conn.userId}:`, err);
      results.push({ userId: conn.userId, provider: conn.provider, status: "error" });
    }
  }

  // Recalculate scores for all affected users
  const affectedUserIds = [...new Set(connections.map((c) => c.userId))];
  for (const uid of affectedUserIds) {
    try {
      const scoreResult = await calculateScores(uid);
      await persistScores(uid, scoreResult);
    } catch (err) {
      console.error(`Score recalculation failed for ${uid}:`, err);
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
