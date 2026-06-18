'use client';

import { useState, useMemo, useTransition } from 'react';
import { createAvatar } from '@dicebear/core';
import * as openPeeps from '@dicebear/open-peeps';
import type { Options } from '@dicebear/open-peeps';
import { Avatar2D, DEFAULT_AVATAR_CONFIG, normalise } from './Avatar2D';
import type { AvatarConfig2D } from './Avatar2D';
import {
  HEAD_OPTIONS,
  FACE_OPTIONS,
  ACCESSORY_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_COLORS,
  BACKGROUND_COLORS,
} from '@/lib/avatar/assets';

const strip = (hex: string | undefined | null) =>
  (hex ?? DEFAULT_AVATAR_CONFIG.skinColor).replace('#', '');

type Tab = 'head' | 'face' | 'extras' | 'colors';

// Renders a tiny DiceBear preview for a single option
function OptionThumb({
  optionId,
  category,
  base,
  isSelected,
  label,
  onSelect,
}: {
  optionId: string;
  category: 'head' | 'face' | 'accessories' | 'facialHair';
  base: AvatarConfig2D;
  isSelected: boolean;
  label: string;
  onSelect: () => void;
}) {
  const svg = useMemo(() => {
    const headVal = category === 'head' ? optionId : base.head;
    const faceVal = category === 'face' ? optionId : base.face;
    const accVal = category === 'accessories' ? optionId : base.accessories;
    const fhVal = category === 'facialHair' ? optionId : base.facialHair;

    const opts: Options & { seed?: string; size?: number; backgroundColor?: string[] } = {
      seed: optionId,
      size: 64,
      head: [headVal] as Options['head'],
      face: [faceVal] as Options['face'],
      skinColor: [strip(base.skinColor)],
      headContrastColor: [strip(base.headContrastColor)],
      clothingColor: [strip(base.clothingColor)],
      backgroundColor: [isSelected ? strip(base.backgroundColor) : '374151'],
      accessoriesProbability: accVal ? 100 : 0,
      facialHairProbability: fhVal ? 100 : 0,
    };
    if (accVal) opts.accessories = [accVal] as Options['accessories'];
    if (fhVal) opts.facialHair = [fhVal] as Options['facialHair'];

    return createAvatar(openPeeps, opts).toString();
  }, [optionId, category, base, isSelected]);

  return (
    <button
      onClick={onSelect}
      title={label}
      className={`relative rounded-lg overflow-hidden transition-all flex flex-col items-center gap-1 p-1 ${
        isSelected
          ? 'ring-2 ring-blue-400 scale-105 bg-blue-500/10'
          : 'hover:ring-1 hover:ring-zinc-500 hover:scale-102'
      }`}
    >
      <div
        className="rounded overflow-hidden"
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ width: 64, height: 64 }}
      />
      <span className="text-[10px] text-zinc-400 truncate w-16 text-center leading-tight">{label}</span>
    </button>
  );
}

function ColorSwatch({
  hex,
  label,
  isSelected,
  onSelect,
}: {
  hex: string;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      title={label}
      className={`w-8 h-8 rounded-full border-2 transition-all ${
        isSelected ? 'border-blue-400 scale-110' : 'border-transparent hover:border-zinc-500'
      }`}
      style={{ backgroundColor: hex }}
    />
  );
}

interface AvatarBuilder2DProps {
  initialConfig?: AvatarConfig2D;
  onSave?: (config: AvatarConfig2D) => void;
  ctaLabel?: string;
  seed?: string;
}

export function AvatarBuilder2D({
  initialConfig,
  onSave,
  ctaLabel = 'Save Avatar',
  seed,
}: AvatarBuilder2DProps) {
  const [config, setConfig] = useState<AvatarConfig2D>(() =>
    normalise(initialConfig ?? DEFAULT_AVATAR_CONFIG)
  );
  const [tab, setTab] = useState<Tab>('head');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AvatarConfig2D>(key: K, value: AvatarConfig2D[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarConfig: config }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? 'Failed to save');
        }
        setSaved(true);
        onSave?.(config);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    });
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'head', label: 'Head' },
    { id: 'face', label: 'Face' },
    { id: 'extras', label: 'Extras' },
    { id: 'colors', label: 'Colors' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Preview + tabs side-by-side on wider screens */}
      <div className="flex flex-col sm:flex-row gap-6">

        {/* Live preview (sticky on desktop) */}
        <div className="flex flex-col items-center gap-3 sm:sticky sm:top-4 sm:self-start">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Preview</div>
          <Avatar2D config={config} size={180} seed={seed} />
        </div>

        {/* Tab panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Tab bar */}
          <div className="flex border-b border-zinc-800">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  tab === t.id
                    ? 'text-white border-b-2 border-blue-400 -mb-px'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Head tab */}
          {tab === 'head' && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {HEAD_OPTIONS.map((opt) => (
                <OptionThumb
                  key={opt.id}
                  optionId={opt.id}
                  category="head"
                  base={config}
                  isSelected={config.head === opt.id}
                  label={opt.label}
                  onSelect={() => set('head', opt.id)}
                />
              ))}
            </div>
          )}

          {/* Face tab */}
          {tab === 'face' && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {FACE_OPTIONS.map((opt) => (
                <OptionThumb
                  key={opt.id}
                  optionId={opt.id}
                  category="face"
                  base={config}
                  isSelected={config.face === opt.id}
                  label={opt.label}
                  onSelect={() => set('face', opt.id)}
                />
              ))}
            </div>
          )}

          {/* Extras tab — accessories + facial hair */}
          {tab === 'extras' && (
            <div className="space-y-5">
              <div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">
                  Accessories
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {/* None option */}
                  <button
                    onClick={() => set('accessories', null)}
                    className={`flex flex-col items-center gap-1 p-1 rounded-lg border-2 transition-all text-xs ${
                      config.accessories === null
                        ? 'border-blue-400 bg-blue-500/10 text-blue-300'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                    }`}
                    style={{ width: 72 }}
                  >
                    <div className="w-16 h-16 flex items-center justify-center text-lg">–</div>
                    <span className="text-[10px] truncate w-full text-center">None</span>
                  </button>
                  {ACCESSORY_OPTIONS.map((opt) => (
                    <OptionThumb
                      key={opt.id}
                      optionId={opt.id}
                      category="accessories"
                      base={config}
                      isSelected={config.accessories === opt.id}
                      label={opt.label}
                      onSelect={() => set('accessories', opt.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">
                  Facial Hair
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => set('facialHair', null)}
                    className={`flex flex-col items-center gap-1 p-1 rounded-lg border-2 transition-all text-xs ${
                      config.facialHair === null
                        ? 'border-blue-400 bg-blue-500/10 text-blue-300'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                    }`}
                    style={{ width: 72 }}
                  >
                    <div className="w-16 h-16 flex items-center justify-center text-lg">–</div>
                    <span className="text-[10px] truncate w-full text-center">None</span>
                  </button>
                  {FACIAL_HAIR_OPTIONS.map((opt) => (
                    <OptionThumb
                      key={opt.id}
                      optionId={opt.id}
                      category="facialHair"
                      base={config}
                      isSelected={config.facialHair === opt.id}
                      label={opt.label}
                      onSelect={() => set('facialHair', opt.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Colors tab */}
          {tab === 'colors' && (
            <div className="space-y-6">
              {/* Skin Tone */}
              <div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Skin Tone</div>
                <div className="flex flex-wrap gap-2 items-center">
                  {SKIN_TONES.map((t) => (
                    <ColorSwatch
                      key={t.id}
                      hex={t.hex}
                      label={t.label}
                      isSelected={config.skinColor === t.hex}
                      onSelect={() => set('skinColor', t.hex)}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.skinColor}
                    onChange={(e) => set('skinColor', e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-zinc-700 cursor-pointer bg-transparent overflow-hidden"
                    title="Custom skin tone"
                  />
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Hair Color</div>
                <div className="flex flex-wrap gap-2 items-center">
                  {HAIR_COLORS.map((c) => (
                    <ColorSwatch
                      key={c.id}
                      hex={c.hex}
                      label={c.label}
                      isSelected={config.headContrastColor === c.hex}
                      onSelect={() => set('headContrastColor', c.hex)}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.headContrastColor}
                    onChange={(e) => set('headContrastColor', e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-zinc-700 cursor-pointer bg-transparent overflow-hidden"
                    title="Custom hair color"
                  />
                </div>
              </div>

              {/* Clothing Color */}
              <div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Clothing</div>
                <div className="flex flex-wrap gap-2 items-center">
                  {CLOTHING_COLORS.map((c) => (
                    <ColorSwatch
                      key={c.id}
                      hex={c.hex}
                      label={c.label}
                      isSelected={config.clothingColor === c.hex}
                      onSelect={() => set('clothingColor', c.hex)}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.clothingColor}
                    onChange={(e) => set('clothingColor', e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-zinc-700 cursor-pointer bg-transparent overflow-hidden"
                    title="Custom clothing color"
                  />
                </div>
              </div>

              {/* Background */}
              <div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Background</div>
                <div className="flex flex-wrap gap-2 items-center">
                  {BACKGROUND_COLORS.map((c) => (
                    <ColorSwatch
                      key={c.id}
                      hex={c.hex}
                      label={c.label}
                      isSelected={config.backgroundColor === c.hex}
                      onSelect={() => set('backgroundColor', c.hex)}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => set('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-zinc-700 cursor-pointer bg-transparent overflow-hidden"
                    title="Custom background"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
      >
        {isPending ? 'Saving…' : saved ? 'Saved!' : ctaLabel}
      </button>
    </div>
  );
}
