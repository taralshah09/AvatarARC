'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync/all', { method: 'POST' });
      router.refresh();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
        bg-zinc-800 border border-zinc-700 text-zinc-300
        hover:bg-zinc-700 hover:text-white hover:border-zinc-500
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
    >
      {syncing ? 'Syncing…' : 'Sync Now'}
    </button>
  );
}
