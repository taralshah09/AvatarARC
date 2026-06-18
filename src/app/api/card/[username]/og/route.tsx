import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'edge';

function themeColors(ovr: number | null) {
  const s = ovr ?? 0;
  if (s >= 85) return { bg: '#1a1408', accent: '#f59e0b', text: '#fef3c7' };
  if (s >= 70) return { bg: '#1e1b4b', accent: '#8b5cf6', text: '#ede9fe' };
  return { bg: '#0f172a', accent: '#3b82f6', text: '#e0f2fe' };
}

const AXES = [
  { label: 'VIT', field: 'vitality' },
  { label: 'STR', field: 'strategy' },
  { label: 'CRA', field: 'craft' },
  { label: 'GRT', field: 'grit' },
  { label: 'DIS', field: 'discipline' },
  { label: 'LOG', field: 'logic' },
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { score: true },
    });

    if (!user) {
      return new Response('Not found', { status: 404 });
    }

    const score = user.score;
    const ovr = score?.overall ?? null;
    const { bg, accent, text } = themeColors(ovr);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bg,
            fontFamily: 'sans-serif',
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(ellipse at 50% 0%, ${accent}33 0%, transparent 60%)`,
            }}
          />

          {/* Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: `3px solid ${accent}`,
              borderRadius: '24px',
              padding: '48px 56px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              width: '900px',
              gap: '32px',
              position: 'relative',
            }}
          >
            {/* Brand */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ color: accent, fontSize: '20px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>AvatarARC</span>
              <span style={{ color: accent, fontSize: '18px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', border: `1px solid ${accent}55`, borderRadius: '20px', padding: '4px 14px' }}>
                {ovr !== null && ovr >= 85 ? 'Legendary' : ovr !== null && ovr >= 70 ? 'Rare' : 'Standard'}
              </span>
            </div>

            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', width: '100%' }}>
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '70px',
                  border: `4px solid ${accent}`,
                  backgroundColor: `${accent}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '52px',
                  fontWeight: 900,
                  color: accent,
                  flexShrink: 0,
                }}
              >
                {(user.displayName ?? user.username ?? 'U').substring(0, 2).toUpperCase()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: 'white', fontSize: '52px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>
                  {user.displayName ?? user.username}
                </span>
                <span style={{ color: `${text}99`, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  {score?.archetype ?? 'Novice'}
                </span>
              </div>

              {/* OVR badge */}
              <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: accent, fontSize: '96px', fontWeight: 900, lineHeight: 1 }}>
                  {ovr !== null ? Math.round(ovr) : '–'}
                </span>
                <span style={{ color: `${text}80`, fontSize: '22px', letterSpacing: '6px' }}>OVR</span>
              </div>
            </div>

            {/* 6-axis grid */}
            <div style={{ display: 'flex', width: '100%', gap: '16px' }}>
              {AXES.map(({ label, field }) => {
                const val = score?.[field] ?? null;
                return (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '14px 8px',
                      border: `1px solid rgba(255,255,255,0.08)`,
                    }}
                  >
                    <span style={{ color: `${text}66`, fontSize: '16px', fontWeight: 700, letterSpacing: '2px' }}>{label}</span>
                    <span style={{ color: val !== null ? 'white' : 'rgba(255,255,255,0.2)', fontSize: '32px', fontWeight: 900, lineHeight: 1, marginTop: '4px' }}>
                      {val !== null ? Math.round(val as number) : '–'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Level + XP */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <span style={{ color: `${text}80`, fontSize: '22px' }}>Lv.{score?.level ?? 1}</span>
              <span style={{ color: `${text}80`, fontSize: '22px' }}>{(score?.xp ?? 0).toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
