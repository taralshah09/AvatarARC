import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await prisma.scoreHistory.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      take: 90,
    });

    return NextResponse.json(history);
  } catch (err) {
    console.error("Failed to fetch score history:", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
