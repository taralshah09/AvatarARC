import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateScores, persistScores } from "@/lib/scoring";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await calculateScores(user.id);
    await persistScores(user.id, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Score calculation failed:", err);
    return NextResponse.json({ error: "Score calculation failed" }, { status: 500 });
  }
}
