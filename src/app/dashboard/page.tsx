import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { ConnectionsPanel } from "@/components/dashboard/ConnectionsPanel";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { DashboardCardSection } from "@/components/dashboard/DashboardCardSection";
import { NavAvatarDrawer } from "@/components/avatar/NavAvatarDrawer";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import type { AvatarConfig2D } from "@/components/avatar/Avatar2D";
import type { ScoreResult } from "@/lib/scoring";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check onboarding before anything else (lightweight query)
  const onboardingCheck = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingComplete: true },
  });
  if (!onboardingCheck?.onboardingComplete) {
    redirect("/onboarding");
  }

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? user.email;

  const [dbUser, connections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: { score: true },
    }),
    prisma.connectedProvider.findMany({
      where: { userId: user.id },
      select: {
        provider: true,
        providerUserId: true,
        lastSyncedAt: true,
        syncStatus: true,
        connectedAt: true,
      },
    }),
  ]);

  const serializedConnections = connections.map((c) => ({
    ...c,
    lastSyncedAt: c.lastSyncedAt?.toISOString() ?? null,
    connectedAt: c.connectedAt.toISOString(),
  }));

  const score = dbUser?.score;
  const username = dbUser?.username ?? user.user_metadata?.user_name ?? null;

  const avatarConfig =
    dbUser?.avatarConfig &&
    (dbUser.avatarConfig as Record<string, unknown>).type === '2d'
      ? (dbUser.avatarConfig as unknown as AvatarConfig2D)
      : undefined;

  let scoreResult: ScoreResult | null = null;
  if (score) {
    scoreResult = {
      vitality: score.vitality,
      discipline: score.discipline,
      logic: score.logic,
      strategy: score.strategy,
      craft: score.craft,
      grit: score.grit,
      overall: score.overall,
      archetype: score.archetype,
      axesPopulated: score.axesPopulated,
      xp: score.xp,
      level: score.level,
    };
  }

  const cardUrl = username ? `/card/${username}` : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">AvatarARC</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-white font-medium">
              Dashboard
            </Link>
            {cardUrl && (
              <Link href={cardUrl} className="text-zinc-400 hover:text-white transition-colors">
                My Card
              </Link>
            )}
            <Link href="/leaderboard" className="text-zinc-400 hover:text-white transition-colors">
              Leaderboard
            </Link>
            {username && (
              <Link href={`/compare?a=${username}`} className="text-zinc-400 hover:text-white transition-colors">
                Compare
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NavAvatarDrawer initialConfig={avatarConfig} seed={username ?? undefined} />
          <span className="text-zinc-400 text-sm">{displayName}</span>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-10">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Connect your platforms to start building your arc.
            </p>
          </div>

          {scoreResult && username ? (
            <DashboardCardSection
              user={{
                username,
                displayName: dbUser?.displayName,
                avatarUrl: dbUser?.avatarUrl,
                avatarConfig: dbUser?.avatarConfig,
              }}
              scores={scoreResult}
              sourcesConnected={connections.length}
              shareUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}${cardUrl}`}
            />
          ) : (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Your Card
                </h2>
                <SyncButton />
              </div>
              <p className="text-zinc-500 text-sm">
                Connect a platform and sync to generate your player card.
              </p>
            </section>
          )}

          {scoreResult && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Score Evolution
              </h2>
              <EvolutionChart />
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Connected Platforms
            </h2>
            <ConnectionsPanel initialConnections={serializedConnections} />
          </section>
        </div>
      </main>
    </div>
  );
}
