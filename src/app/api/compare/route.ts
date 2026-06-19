import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const a = searchParams.get('a');
  const b = searchParams.get('b');

  if (!a || !b) {
    return NextResponse.json({ error: 'Both a and b usernames are required' }, { status: 400 });
  }

  const [userA, userB] = await Promise.all([
    prisma.user.findUnique({ where: { username: a }, include: { score: true } }),
    prisma.user.findUnique({ where: { username: b }, include: { score: true } }),
  ]);

  if (!userA) {
    return NextResponse.json({ error: `User '${a}' not found` }, { status: 404 });
  }
  if (!userB) {
    return NextResponse.json({ error: `User '${b}' not found` }, { status: 404 });
  }

  return NextResponse.json({ userA, userB });
}
