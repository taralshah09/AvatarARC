'use client';

import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as openPeeps from '@dicebear/open-peeps';
import type { Options } from '@dicebear/open-peeps';

export interface AvatarConfig2D {
  type: '2d';
  head: string;
  face: string;
  accessories: string | null;
  facialHair: string | null;
  skinColor: string;          // hex with #
  headContrastColor: string;  // hair color, hex with #
  clothingColor: string;      // hex with #
  backgroundColor: string;    // hex with #
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig2D = {
  type: '2d',
  head: 'short1',
  face: 'smile',
  accessories: null,
  facialHair: null,
  skinColor: '#E8B88A',
  headContrastColor: '#1a1a1a',
  clothingColor: '#1e3a5f',
  backgroundColor: '#0f172a',
};

const strip = (hex: string | undefined | null) =>
  (hex ?? DEFAULT_AVATAR_CONFIG.skinColor).replace('#', '');

// Merge incoming config with defaults so stale/partial DB records never crash
export function normalise(raw: AvatarConfig2D): AvatarConfig2D {
  return {
    ...DEFAULT_AVATAR_CONFIG,
    ...raw,
    // Guard required string fields against undefined from old schema
    head: raw.head || DEFAULT_AVATAR_CONFIG.head,
    face: raw.face || DEFAULT_AVATAR_CONFIG.face,
    skinColor: raw.skinColor || DEFAULT_AVATAR_CONFIG.skinColor,
    headContrastColor: raw.headContrastColor || DEFAULT_AVATAR_CONFIG.headContrastColor,
    clothingColor: raw.clothingColor || DEFAULT_AVATAR_CONFIG.clothingColor,
    backgroundColor: raw.backgroundColor || DEFAULT_AVATAR_CONFIG.backgroundColor,
  };
}

interface Avatar2DProps {
  config: AvatarConfig2D;
  size?: number;
  seed?: string;
}

export function Avatar2D({ config, size = 120, seed = 'avatararc' }: Avatar2DProps) {
  const svgString = useMemo(() => {
    const c = normalise(config);
    const opts: Options & { seed?: string; size?: number; backgroundColor?: string[] } = {
      seed,
      size,
      head: [c.head] as Options['head'],
      face: [c.face] as Options['face'],
      skinColor: [strip(c.skinColor)],
      headContrastColor: [strip(c.headContrastColor)],
      clothingColor: [strip(c.clothingColor)],
      backgroundColor: [strip(c.backgroundColor)],
      accessoriesProbability: c.accessories ? 100 : 0,
      facialHairProbability: c.facialHair ? 100 : 0,
    };
    if (c.accessories) opts.accessories = [c.accessories] as Options['accessories'];
    if (c.facialHair) opts.facialHair = [c.facialHair] as Options['facialHair'];
    return createAvatar(openPeeps, opts).toString();
  }, [config, size, seed]);

  return (
    <div
      style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
