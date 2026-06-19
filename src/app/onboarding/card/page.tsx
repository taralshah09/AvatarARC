import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/client';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { OnboardingCardStep } from './OnboardingCardStep';
import type { ScoreResult } from '@/lib/scoring';
import type { AvatarConfig2D } from '@/components/avatar/Avatar2D';

export default async function OnboardingCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { score: true },
  });

  const username = dbUser?.username ?? (user.user_metadata?.user_name as string | undefined) ?? null;
  const score = dbUser?.score;

  const avatarConfig =
    dbUser?.avatarConfig &&
    (dbUser.avatarConfig as Record<string, unknown>).type === '2d'
      ? (dbUser.avatarConfig as unknown as AvatarConfig2D)
      : undefined;

  const scoreResult: ScoreResult | null = score
    ? {
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
      }
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-2">
          <span className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">
            AvatarARC
          </span>
        </div>
        <StepProgress step={3} />
        <div className="mb-8 text-center">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Step 3 of 3
          </div>
          <h1 className="text-2xl font-bold">Your card is ready</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            {scoreResult
              ? 'Connect more platforms to unlock all 6 axes.'
              : 'Sync your platforms on the dashboard to generate scores.'}
          </p>
        </div>
        <OnboardingCardStep
          username={username}
          user={{
            username: username ?? '',
            displayName: dbUser?.displayName,
            avatarUrl: dbUser?.avatarUrl,
            avatarConfig,
          }}
          scores={scoreResult}
        />
      </div>
    </div>
  );
}
