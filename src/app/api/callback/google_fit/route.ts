import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/utils/encryption";

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/dashboard?error=google_fit_missing_code", req.url));

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/google_fit`,
    }),
  });

  if (!tokenRes.ok) return NextResponse.redirect(new URL("/dashboard?error=google_fit_token_failed", req.url));
  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenData.access_token) return NextResponse.redirect(new URL("/dashboard?error=google_fit_token_failed", req.url));

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  await prisma.connectedProvider.upsert({
    where: { userId_provider: { userId: user.id, provider: "google_fit" } },
    create: {
      userId: user.id,
      provider: "google_fit",
      providerUserId: user.id,
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
      tokenExpiresAt: expiresAt,
      scopes: tokenData.scope.split(" "),
      syncStatus: "idle",
    },
    update: {
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
      tokenExpiresAt: expiresAt,
      scopes: tokenData.scope.split(" "),
      syncStatus: "idle",
    },
  });

  return NextResponse.redirect(new URL("/dashboard?connected=google_fit", req.url));
}
