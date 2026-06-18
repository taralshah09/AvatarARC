"use client";

import { useState } from "react";

interface SyncStatusProps {
  provider: string;
  lastSyncedAt?: string | null;
  syncStatus: string;
  onSync: () => Promise<void>;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SyncStatus({ lastSyncedAt, syncStatus, onSync }: SyncStatusProps) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  async function handleSync() {
    setSyncing(true);
    setError("");
    try {
      await onSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const isError = syncStatus === "error";
  const isSyncing = syncStatus === "syncing" || syncing;

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-500">
      {lastSyncedAt ? (
        <span>Synced {formatRelativeTime(lastSyncedAt)}</span>
      ) : (
        <span>Never synced</span>
      )}
      {isError && <span className="text-red-400">Sync error</span>}
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
      >
        {isSyncing ? "Syncing…" : "Sync now"}
      </button>
      {error && <span className="text-red-400">{error}</span>}
    </div>
  );
}
