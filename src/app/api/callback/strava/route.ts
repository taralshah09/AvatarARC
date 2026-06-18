import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/utils/encryption";

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number };
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/dashboard?error=strava_missing_code", req.url));

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) return NextResponse.redirect(new URL("/dashboard?error=strava_token_failed", req.url));
  const data = (await res.json()) as StravaTokenResponse;

  await prisma.connectedProvider.upsert({
    where: { userId_provider: { userId: user.id, provider: "strava" } },
    create: {
      userId: user.id,
      provider: "strava",
      providerUserId: String(data.athlete.id),
      accessToken: encrypt(data.access_token),
      refreshToken: encrypt(data.refresh_token),
      tokenExpiresAt: new Date(data.expires_at * 1000),
      scopes: ["activity:read_all"],
      syncStatus: "idle",
    },
    update: {
      providerUserId: String(data.athlete.id),
      accessToken: encrypt(data.access_token),
      refreshToken: encrypt(data.refresh_token),
      tokenExpiresAt: new Date(data.expires_at * 1000),
      syncStatus: "idle",
    },
  });

  return NextResponse.redirect(new URL("/dashboard?connected=strava", req.url));
}
