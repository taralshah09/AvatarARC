import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const VALID_AXES = ['overall', 'vitality', 'discipline', 'logic', 'strategy', 'craft', 'grit'] as const;
type Axis = (typeof VALID_AXES)[number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const axis = (searchParams.get('axis') ?? 'overall') as Axis;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 50);

  if (!VALID_AXES.includes(axis)) {
    return NextResponse.json({ error: 'Invalid axis' }, { status: 400 });
  }

  const scores = await prisma.score.findMany({
    where: { [axis]: { not: null } },
    orderBy: { [axis]: 'desc' },
    take: limit,
    include: {
      user: {
        select: { username: true, displayName: true, avatarUrl: true, avatarConfig: true },
      },
    },
  });

  const rows = scores.map((s, i) => ({
    rank: i + 1,
    username: s.user.username,
    displayName: s.user.displayName,
    avatarUrl: s.user.avatarUrl,
    avatarConfig: s.user.avatarConfig,
    score: s[axis] as number,
  }));

  return NextResponse.json(rows, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
