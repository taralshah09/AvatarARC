import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/client';
import { OnboardingAvatarBuilder } from './OnboardingAvatarBuilder';

export default async function OnboardingAvatarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarConfig: true },
  });

  if (dbUser?.avatarConfig) {
    redirect('/onboarding/card');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-2">
          <span className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">
            AvatarARC
          </span>
        </div>
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="w-8 h-2 rounded-full bg-blue-500" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
        </div>
        <div className="mb-8">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Step 2 of 3
          </div>
          <h1 className="text-2xl font-bold">Build your avatar</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Customize how you appear on your player card. You can change this anytime.
          </p>
        </div>
        <OnboardingAvatarBuilder />
      </div>
    </div>
  );
}
