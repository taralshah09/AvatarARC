import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/utils/encryption";

function deriveUsername(user: { email?: string | null; user_metadata?: Record<string, string> }): string | null {
  const fromMeta = user.user_metadata?.user_name;
  if (fromMeta) return fromMeta;
  const email = user.email;
  if (!email) return null;
  return email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30) || null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user, session } = data;

      const username = deriveUsername(user as Parameters<typeof deriveUsername>[0]);

      const dbUser = await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          username,
          displayName: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
        update: {
          email: user.email!,
          username,
          displayName: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
        select: { avatarConfig: true },
      });

      // If Google sign-in returned a Fit-scoped token, store it as a connected provider
      const providerToken = session?.provider_token;
      const providerRefreshToken = session?.provider_refresh_token;
      if (providerToken && user.app_metadata?.provider === "google") {
        await prisma.connectedProvider.upsert({
          where: { userId_provider: { userId: user.id, provider: "google_fit" } },
          create: {
            userId: user.id,
            provider: "google_fit",
            providerUserId: user.id,
            accessToken: encrypt(providerToken),
            refreshToken: providerRefreshToken ? encrypt(providerRefreshToken) : null,
            scopes: [
              "https://www.googleapis.com/auth/fitness.activity.read",
              "https://www.googleapis.com/auth/fitness.body.read",
            ],
            syncStatus: "idle",
          },
          update: {
            accessToken: encrypt(providerToken),
            refreshToken: providerRefreshToken ? encrypt(providerRefreshToken) : null,
            syncStatus: "idle",
          },
        });
      }

      // New users (no avatar yet) go to avatar onboarding, unless a specific `next` was requested
      const destination = !dbUser.avatarConfig && next === "/dashboard"
        ? "/onboarding/avatar"
        : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
