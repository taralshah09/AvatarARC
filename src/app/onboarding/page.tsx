import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/client';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingComplete: true },
  });

  if (dbUser?.onboardingComplete) redirect('/dashboard');

  redirect('/onboarding/connect');
}
