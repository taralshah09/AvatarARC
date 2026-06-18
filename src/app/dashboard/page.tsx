import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/SignOutButton";

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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">AvatarARC</span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">{displayName}</span>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400">
            Connect your first platform to start building your arc.
          </p>
          <div className="mt-8 border border-dashed border-zinc-700 rounded-xl p-12 text-zinc-600">
            Platform connections coming soon
          </div>
        </div>
      </main>
    </div>
  );
}
