import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/client';

interface AvatarConfig2D {
  type: '2d';
  head: string;
  face: string;
  accessories: string | null;
  facialHair: string | null;
  skinColor: string;
  headContrastColor: string;
  clothingColor: string;
  backgroundColor: string;
}

function isValidAvatarConfig(v: unknown): v is AvatarConfig2D {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return (
    obj.type === '2d' &&
    typeof obj.head === 'string' &&
    typeof obj.face === 'string' &&
    (obj.accessories === null || typeof obj.accessories === 'string') &&
    (obj.facialHair === null || typeof obj.facialHair === 'string') &&
    typeof obj.skinColor === 'string' &&
    typeof obj.headContrastColor === 'string' &&
    typeof obj.clothingColor === 'string' &&
    typeof obj.backgroundColor === 'string'
  );
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, avatarConfig } = body as {
      displayName?: string;
      avatarConfig?: unknown;
    };

    const updateData: Record<string, unknown> = {};

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.trim().length === 0) {
        return NextResponse.json({ error: 'Invalid displayName' }, { status: 400 });
      }
      updateData.displayName = displayName.trim();
    }

    if (avatarConfig !== undefined) {
      if (!isValidAvatarConfig(avatarConfig)) {
        return NextResponse.json({ error: 'Invalid avatarConfig' }, { status: 400 });
      }
      updateData.avatarConfig = avatarConfig;
      updateData.avatarUrl = null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        avatarConfig: true,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('PUT /api/profile error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
