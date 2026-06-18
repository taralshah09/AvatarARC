import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { ConnectionsPanel } from "@/components/dashboard/ConnectionsPanel";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? user.email;

  const connections = await prisma.connectedProvider.findMany({
    where: { userId: user.id },
    select: {
      provider: true,
      providerUserId: true,
      lastSyncedAt: true,
      syncStatus: true,
      connectedAt: true,
    },
  });

  // Serialize dates for client component
  const serializedConnections = connections.map((c) => ({
    ...c,
    lastSyncedAt: c.lastSyncedAt?.toISOString() ?? null,
    connectedAt: c.connectedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">AvatarARC</span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">{displayName}</span>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Connect your platforms to start building your arc.
            </p>
          </div>

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
