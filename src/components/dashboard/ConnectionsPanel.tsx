"use client";

import { useState, useCallback } from "react";
import { ConnectButton } from "./ConnectButton";
import { SyncStatus } from "./SyncStatus";

interface Connection {
  provider: string;
  providerUserId: string;
  lastSyncedAt: string | null;
  syncStatus: string;
  connectedAt: string;
}

const PROVIDERS = [
  { id: "github", label: "GitHub" },
  { id: "chess_com", label: "Chess.com" },
  { id: "strava", label: "Strava" },
  { id: "codeforces", label: "Codeforces" },
  { id: "google_fit", label: "Google Fit" },
];

interface ConnectionsPanelProps {
  initialConnections: Connection[];
}

export function ConnectionsPanel({ initialConnections }: ConnectionsPanelProps) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  async function refreshConnections() {
    const res = await fetch("/api/connections");
    if (res.ok) {
      const data = await res.json() as Connection[];
      setConnections(data);
    }
  }

  const handleUsernameConnect = useCallback(
    (provider: string) => async (username: string) => {
      const res = await fetch(`/api/connect/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          provider === "chess_com" ? { username } : { handle: username }
        ),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Connection failed");
      }
      await refreshConnections();
    },
    []
  );

  const handleDisconnect = useCallback((provider: string) => async () => {
    await fetch(`/api/connect/${provider}/disconnect`, { method: "DELETE" });
    await refreshConnections();
  }, []);

  const handleSync = useCallback((provider: string) => async () => {
    const res = await fetch(`/api/sync/${provider}`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? "Sync failed");
    }
    await refreshConnections();
  }, []);

  const getConnection = (provider: string) =>
    connections.find((c) => c.provider === provider);

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ id, label }) => {
        const conn = getConnection(id);
        return (
          <div
            key={id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
          >
            <div>
              <p className="font-medium text-sm text-white">{label}</p>
              {conn && (
                <SyncStatus
                  provider={id}
                  lastSyncedAt={conn.lastSyncedAt}
                  syncStatus={conn.syncStatus}
                  onSync={handleSync(id)}
                />
              )}
            </div>
            <ConnectButton
              provider={id}
              label={label}
              isConnected={!!conn}
              providerUserId={conn?.providerUserId}
              onUsernameConnect={
                id === "chess_com" || id === "codeforces"
                  ? handleUsernameConnect(id)
                  : undefined
              }
              onDisconnect={handleDisconnect(id)}
            />
          </div>
        );
      })}
    </div>
  );
}
