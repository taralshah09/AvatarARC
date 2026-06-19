import Link from 'next/link';
import { PlayerCard } from '@/components/card/PlayerCard';
import { SignInButton } from '@/components/auth/SignInButton';
import { EXAMPLE_CARDS } from '@/lib/landing/examples';

const AXES = [
  {
    key: 'Vitality',
    icon: '🏃',
    description: 'Physical activity, fitness consistency, and endurance. Powered by Strava.',
  },
  {
    key: 'Discipline',
    icon: '🔥',
    description: 'Cross-platform streaks — how consistently you show up every day.',
  },
  {
    key: 'Logic',
    icon: '🧠',
    description: 'Problem-solving ability via competitive programming and chess puzzles.',
  },
  {
    key: 'Strategy',
    icon: '♟️',
    description: 'Chess rating, win rate, opening breadth — your long-term thinking.',
  },
  {
    key: 'Craft',
    icon: '⚒️',
    description: 'Code quality, language diversity, and open source contributions on GitHub.',
  },
  {
    key: 'Grit',
    icon: '💪',
    description: 'Sustained trends over time. Grit rewards showing up for weeks, not days.',
  },
];

const PLATFORMS = [
  { label: 'GitHub', available: true },
  { label: 'Chess.com', available: true },
  { label: 'Strava', available: true },
  { label: 'Codeforces', available: true },
  { label: 'Lichess', available: true },
  { label: 'Google Health', available: false },
  { label: 'LeetCode', available: false },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-black text-lg tracking-tight">AvatarARC</span>
        <SignInButton className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-100 transition-colors">
          Sign in
        </SignInButton>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-widest">
            100% free · no credit card
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Your real-life data.
            <br />
            <span className="text-blue-400">Your player card.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Connect GitHub, Chess.com, Strava, and more. AvatarARC scores you across 6 axes and generates a FIFA-style player card from your actual activity.
          </p>
          <SignInButton className="inline-flex items-center gap-3 bg-white text-black font-semibold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Get your card free
          </SignInButton>
          <p className="text-zinc-600 text-xs">Sign in with GitHub to get started.</p>
        </div>

        {/* Hero card — faded legendary example */}
        <div className="flex justify-center md:justify-end opacity-80">
          <div className="pointer-events-none select-none">
            <PlayerCard
              user={EXAMPLE_CARDS[2].user}
              scores={EXAMPLE_CARDS[2].scores}
              sourcesConnected={EXAMPLE_CARDS[2].sourcesConnected}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-10 text-center">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Connect your platforms',
              body: 'Link GitHub, Chess.com, Strava, Codeforces, and Lichess with one click. No manual data entry.',
            },
            {
              step: '02',
              title: 'Get your scores',
              body: 'Our engine calculates your 6-axis score from real activity data — not self-reported numbers.',
            },
            {
              step: '03',
              title: 'Share your card',
              body: 'Every card has a public URL. Share it on your resume, GitHub profile, or anywhere you want to flex.',
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="space-y-3">
              <div className="text-3xl font-black text-zinc-800">{step}</div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example cards */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 text-center">
          Example cards
        </h2>
        <p className="text-zinc-500 text-sm text-center mb-10">
          Standard · Rare · Legendary — determined by your overall score.
        </p>
        <div className="flex flex-wrap gap-6 justify-center">
          {EXAMPLE_CARDS.map((example) => (
            <div key={example.user.username} className="pointer-events-none select-none">
              <PlayerCard
                user={example.user}
                scores={example.scores}
                sourcesConnected={example.sourcesConnected}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Axes explained */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-10 text-center">
          The 6 axes
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AXES.map(({ key, icon, description }) => (
            <div
              key={key}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="font-bold text-white">{key}</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-zinc-600 text-xs mt-6">
          OVR = mean of populated axes only. Empty axes are greyed out, not penalised.
        </p>
      </section>

      {/* Platforms */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8 text-center">
          Supported platforms
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {PLATFORMS.map(({ label, available }) => (
            <div
              key={label}
              className={`px-4 py-2 rounded-full border text-sm font-medium ${
                available
                  ? 'border-zinc-700 text-zinc-300 bg-zinc-900'
                  : 'border-zinc-800 text-zinc-600 bg-zinc-950'
              }`}
            >
              {label}
              {!available && (
                <span className="ml-2 text-[10px] text-zinc-700 uppercase tracking-wider">
                  soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center space-y-6">
          <h2 className="text-3xl font-black">Ready to see your arc?</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            It takes under 2 minutes. Connect GitHub and your card generates automatically.
          </p>
          <SignInButton className="inline-flex items-center gap-3 bg-white text-black font-semibold py-3 px-8 rounded-xl hover:bg-zinc-200 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Get your card free
          </SignInButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <span className="font-black text-zinc-400">AvatarARC</span>
          <div className="flex items-center gap-6">
            <Link href="/leaderboard" className="hover:text-zinc-400 transition-colors">
              Leaderboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              GitHub
            </a>
          </div>
          <span>Built solo on free tier.</span>
        </div>
      </footer>
    </main>
  );
}
