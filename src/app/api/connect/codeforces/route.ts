import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { handle } = await req.json() as { handle?: string };
  if (!handle?.trim()) return NextResponse.json({ error: "Handle required" }, { status: 400 });

  // Verify the handle exists
  const check = await fetch(
    `https://codeforces.com/api/user.info?handles=${handle.trim()}`
  );
  const json = await check.json();
  if (json.status !== "OK") return NextResponse.json({ error: "Codeforces handle not found" }, { status: 404 });

  await prisma.connectedProvider.upsert({
    where: { userId_provider: { userId: user.id, provider: "codeforces" } },
    create: {
      userId: user.id,
      provider: "codeforces",
      providerUserId: handle.trim(),
      accessToken: "public",
      scopes: [],
      syncStatus: "idle",
    },
    update: {
      providerUserId: handle.trim(),
      accessToken: "public",
      syncStatus: "idle",
    },
  });

  return NextResponse.json({ success: true });
}
