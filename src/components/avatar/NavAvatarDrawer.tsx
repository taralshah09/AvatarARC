'use client';

import React, { useState } from 'react';
import { AvatarBuilder2D } from './AvatarBuilder2D';
import { Avatar2D } from './Avatar2D';
import type { AvatarConfig2D } from './Avatar2D';

interface NavAvatarDrawerProps {
  initialConfig?: AvatarConfig2D;
  seed?: string;
}

export function NavAvatarDrawer({ initialConfig, seed }: NavAvatarDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors text-sm text-zinc-300 hover:text-white"
        title="Edit avatar"
      >
        {initialConfig ? (
          <span className="rounded overflow-hidden" style={{ width: 24, height: 24, display: 'block' }}>
            <Avatar2D config={initialConfig} size={24} seed={seed} />
          </span>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
        <span>Avatar</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-over drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <span className="font-semibold text-white">Avatar Builder</span>
            <p className="text-xs text-zinc-500 mt-0.5">Powered by Open Peeps (CC0)</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AvatarBuilder2D
            initialConfig={initialConfig}
            seed={seed}
            onSave={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
