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
    const score = await prisma.score.findUnique({
      where: { userId: user.id },
    });

    if (!score) {
      return NextResponse.json({ error: "No scores calculated yet" }, { status: 404 });
    }

    return NextResponse.json(score);
  } catch (err) {
    console.error("Failed to fetch scores:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
