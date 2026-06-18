import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const providers = await prisma.connectedProvider.findMany({
    where: { userId: user.id },
    select: {
      provider: true,
      providerUserId: true,
      lastSyncedAt: true,
      syncStatus: true,
      connectedAt: true,
    },
  });

  return NextResponse.json(providers);
}
