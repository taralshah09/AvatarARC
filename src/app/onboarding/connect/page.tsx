import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/client';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { OnboardingConnectClient } from './OnboardingConnectClient';

export default async function OnboardingConnectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const connections = await prisma.connectedProvider.findMany({
    where: { userId: user.id },
    select: { provider: true },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-2">
          <span className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">
            AvatarARC
          </span>
        </div>
        <StepProgress step={1} />
        <div className="mb-8">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Step 1 of 3
          </div>
          <h1 className="text-2xl font-bold">Connect your platforms</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Connect at least one platform to start building your arc.
          </p>
        </div>
        <OnboardingConnectClient initialConnected={connections.map((c) => c.provider)} />
      </div>
    </div>
  );
}
