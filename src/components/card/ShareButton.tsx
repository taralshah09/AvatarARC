'use client';

import { useState } from 'react';

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200
        border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white
        active:scale-95"
    >
      {copied ? '✓ Copied!' : 'Share Card'}
    </button>
  );
}
