'use client';

import { useRouter } from 'next/navigation';
import { AvatarBuilder2D } from '@/components/avatar/AvatarBuilder2D';

export function OnboardingAvatarBuilder() {
  const router = useRouter();

  return (
    <AvatarBuilder2D
      ctaLabel="Save & Continue"
      onSave={() => router.push('/onboarding/card')}
    />
  );
}
