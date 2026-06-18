"use client";

import { useState } from "react";

interface ConnectButtonProps {
  provider: string;
  label: string;
  isConnected: boolean;
  providerUserId?: string;
  onUsernameConnect?: (username: string) => Promise<void>;
  onDisconnect: () => void;
}

export function ConnectButton({
  provider,
  label,
  isConnected,
  providerUserId,
  onUsernameConnect,
  onDisconnect,
}: ConnectButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPublicProvider = provider === "chess_com" || provider === "codeforces";

  async function handleConnect() {
    if (isPublicProvider && onUsernameConnect) {
      setShowInput(true);
    } else {
      window.location.href = `/api/connect/${provider}`;
    }
  }

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || !onUsernameConnect) return;
    setLoading(true);
    setError("");
    try {
      await onUsernameConnect(inputValue.trim());
      setShowInput(false);
      setInputValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-emerald-400 font-medium">
          Connected{providerUserId ? ` · ${providerUserId}` : ""}
        </span>
        <button
          onClick={onDisconnect}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (showInput && isPublicProvider) {
    return (
      <form onSubmit={handleUsernameSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={provider === "chess_com" ? "Chess.com username" : "Codeforces handle"}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-48"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50 hover:bg-zinc-200 transition-colors"
        >
          {loading ? "..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setShowInput(false); setError(""); }}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </form>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-1.5 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
    >
      Connect {label}
    </button>
  );
}
