import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const p = await params;
    const user = await prisma.user.findUnique({
      where: { username: p.username },
      include: { score: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching player card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
