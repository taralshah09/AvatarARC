import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { decrypt } from "@/lib/utils/encryption";
import { adapterRegistry } from "@/lib/adapters/registry";
import { writeSignals } from "@/lib/db/signals";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await prisma.connectedProvider.findMany({
    where: { syncStatus: { not: "syncing" } },
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

  return NextResponse.json({ synced: results.length, results });
}
