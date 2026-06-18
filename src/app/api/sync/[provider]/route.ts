import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { decrypt } from "@/lib/utils/encryption";
import { adapterRegistry } from "@/lib/adapters/registry";
import { writeSignals } from "@/lib/db/signals";
import { calculateScores, persistScores } from "@/lib/scoring";

function isValidCronRequest(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Allow either an authenticated user or a valid cron secret
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isCron = isValidCronRequest(req);

  if (!user && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adapter = adapterRegistry[provider];
  if (!adapter) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  }

  // For user-triggered syncs use their userId; for cron this shouldn't be called directly
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No user context for provider sync" }, { status: 400 });
  }

  const connection = await prisma.connectedProvider.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  if (!connection) {
    return NextResponse.json({ error: "Provider not connected" }, { status: 404 });
  }

  await prisma.connectedProvider.update({
    where: { userId_provider: { userId, provider } },
    data: { syncStatus: "syncing" },
  });

  try {
    const accessToken =
      connection.accessToken === "public"
        ? connection.providerUserId  // public APIs: pass the handle/username
        : decrypt(connection.accessToken!);

    const signals = await adapter.fetchSignals(userId, accessToken);
    await writeSignals(signals);

    // Auto-recalculate scores after new signals are written
    const scoreResult = await calculateScores(userId);
    await persistScores(userId, scoreResult);

    await prisma.connectedProvider.update({
      where: { userId_provider: { userId, provider } },
      data: { syncStatus: "idle", lastSyncedAt: new Date() },
    });

    return NextResponse.json({ success: true, signalsWritten: signals.length });
  } catch (err) {
    await prisma.connectedProvider.update({
      where: { userId_provider: { userId, provider } },
      data: { syncStatus: "error" },
    });
    console.error(`Sync failed for ${provider}:`, err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
