import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/utils/encryption";

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/dashboard?error=github_missing_code", req.url));

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/github`,
    }),
  });

  if (!tokenRes.ok) return NextResponse.redirect(new URL("/dashboard?error=github_token_failed", req.url));
  const tokenData = (await tokenRes.json()) as GitHubTokenResponse;
  if (!tokenData.access_token) return NextResponse.redirect(new URL("/dashboard?error=github_token_failed", req.url));

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const ghUser = (await userRes.json()) as GitHubUser;

  await prisma.connectedProvider.upsert({
    where: { userId_provider: { userId: user.id, provider: "github" } },
    create: {
      userId: user.id,
      provider: "github",
      providerUserId: String(ghUser.id),
      accessToken: encrypt(tokenData.access_token),
      scopes: tokenData.scope ? tokenData.scope.split(",").map((s) => s.trim()) : [],
      syncStatus: "idle",
    },
    update: {
      providerUserId: String(ghUser.id),
      accessToken: encrypt(tokenData.access_token),
      scopes: tokenData.scope ? tokenData.scope.split(",").map((s) => s.trim()) : [],
      syncStatus: "idle",
    },
  });

  return NextResponse.redirect(new URL("/dashboard?connected=github", req.url));
}
