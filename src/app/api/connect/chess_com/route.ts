import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json() as { username?: string };
  if (!username?.trim()) return NextResponse.json({ error: "Username required" }, { status: 400 });

  // Verify the account exists before storing
  const check = await fetch(
    `https://api.chess.com/pub/player/${username.trim()}`,
    { headers: { "User-Agent": "AvatarARC/1.0" } }
  );
  if (!check.ok) return NextResponse.json({ error: "Chess.com username not found" }, { status: 404 });

  await prisma.connectedProvider.upsert({
    where: { userId_provider: { userId: user.id, provider: "chess_com" } },
    create: {
      userId: user.id,
      provider: "chess_com",
      providerUserId: username.trim(),
      accessToken: "public",
      scopes: [],
      syncStatus: "idle",
    },
    update: {
      providerUserId: username.trim(),
      accessToken: "public",
      syncStatus: "idle",
    },
  });

  return NextResponse.json({ success: true });
}
