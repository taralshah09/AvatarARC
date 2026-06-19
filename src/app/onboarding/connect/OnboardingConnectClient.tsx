'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@/components/dashboard/ConnectButton';

const PROVIDERS = [
  { id: 'github', label: 'GitHub' },
  { id: 'chess_com', label: 'Chess.com' },
  { id: 'strava', label: 'Strava' },
  { id: 'codeforces', label: 'Codeforces' },
];

interface OnboardingConnectClientProps {
  initialConnected: string[];
}

export function OnboardingConnectClient({ initialConnected }: OnboardingConnectClientProps) {
  const [connected, setConnected] = useState<string[]>(initialConnected);
  const router = useRouter();

  const refreshConnections = useCallback(async () => {
    const res = await fetch('/api/connections');
    if (res.ok) {
      const data = (await res.json()) as Array<{ provider: string }>;
      setConnected(data.map((c) => c.provider));
    }
  }, []);

  const handleUsernameConnect = useCallback(
    (provider: string) => async (username: string) => {
      const res = await fetch(`/api/connect/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          provider === 'chess_com' ? { username } : { handle: username }
        ),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Connection failed');
      }
      await refreshConnections();
    },
    [refreshConnections]
  );

  const handleDisconnect = useCallback(
    (provider: string) => async () => {
      await fetch(`/api/connect/${provider}/disconnect`, { method: 'DELETE' });
      await refreshConnections();
    },
    [refreshConnections]
  );

  const hasConnection = connected.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {PROVIDERS.map(({ id, label }) => (
          <div
            key={id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
          >
            <span className="font-medium text-sm text-white">{label}</span>
            <ConnectButton
              provider={id}
              label={label}
              isConnected={connected.includes(id)}
              onUsernameConnect={
                id === 'chess_com' || id === 'codeforces'
                  ? handleUsernameConnect(id)
                  : undefined
              }
              onDisconnect={handleDisconnect(id)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={() => router.push('/onboarding/avatar')}
          disabled={!hasConnection}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
            bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.99]
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={() => router.push('/onboarding/avatar')}
          className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
