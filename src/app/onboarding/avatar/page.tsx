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
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Setup — Avatar
          </div>
          <h1 className="text-2xl font-bold">Build your avatar</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Customize how you appear on your player card. You can change this anytime from your profile.
          </p>
        </div>
        <OnboardingAvatarBuilder />
      </div>
    </div>
  );
}
