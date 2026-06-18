'use client';

import { useRouter } from 'next/navigation';
import { AvatarBuilder2D } from '@/components/avatar/AvatarBuilder2D';

export function OnboardingAvatarBuilder() {
  const router = useRouter();

  return (
    <AvatarBuilder2D
      ctaLabel="Save & Go to Dashboard"
      onSave={() => router.push('/dashboard')}
    />
  );
}
