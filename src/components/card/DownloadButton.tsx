'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  username: string;
}

export function DownloadButton({ cardRef, username }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `avatararc-${username}.png`;
      a.click();
    } catch (err) {
      console.error('Card download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
        bg-zinc-800 border border-zinc-700 text-zinc-300
        hover:bg-zinc-700 hover:text-white hover:border-zinc-500
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
    >
      {downloading ? 'Capturing…' : 'Download'}
    </button>
  );
}
