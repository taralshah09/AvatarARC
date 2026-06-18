import type { ProviderAdapter, Signal } from "./types";

const BASE = "https://api.chess.com/pub";

async function chessGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "AvatarARC/1.0 (kalpitmanojshah@gmail.com)" },
  });
  if (!res.ok) throw new Error(`Chess.com error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

interface ChessStats {
  chess_rapid?: { last?: { rating: number }; record?: { win: number; loss: number; draw: number } };
  chess_blitz?: { last?: { rating: number } };
  tactics?: { highest?: { rating: number } };
}

interface ArchivesResponse {
  archives: string[];
}

interface MonthlyGames {
  games: Array<{ pgn?: string; time_class: string; white: { result: string }; black: { result: string }; white_username: string }>;
}

function extractECO(pgn: string): string | null {
  const match = pgn.match(/\[ECO "([A-E]\d{2})"\]/);
  return match ? match[1] : null;
}

export const chessComAdapter: ProviderAdapter = {
  source: "chess_com",

  // accessToken is unused — Chess.com is public. username is passed via providerUserId.
  async fetchSignals(userId: string, accessToken: string): Promise<Signal[]> {
    // accessToken holds the username for public-API providers
    const username = accessToken;

    const stats = await chessGet<ChessStats>(`/player/${username}/stats`);

    const rapidRating = stats.chess_rapid?.last?.rating ?? 0;
    const blitzRating = stats.chess_blitz?.last?.rating ?? 0;
    const puzzleRating = stats.tactics?.highest?.rating ?? 0;

    const record = stats.chess_rapid?.record ?? { win: 0, loss: 0, draw: 0 };
    const total = record.win + record.loss + record.draw;
    const winRateRapid = total > 0 ? (record.win / total) * 100 : 0;

    // Games in the last 12 months
    const archives = await chessGet<ArchivesResponse>(`/player/${username}/games/archives`);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentArchives = archives.archives.filter((url) => {
      const parts = url.split("/");
      const year = parseInt(parts[parts.length - 2]);
      const month = parseInt(parts[parts.length - 1]);
      return new Date(year, month - 1) >= new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth());
    });

    let gamesPlayed365d = 0;
    const last50Games: MonthlyGames["games"] = [];

    // Fetch up to last 3 months for ECO sampling; all for count
    for (const archiveUrl of recentArchives.slice(-3)) {
      const monthData = await chessGet<MonthlyGames>(
        archiveUrl.replace(BASE, "")
      );
      gamesPlayed365d += monthData.games.length;
      last50Games.push(...monthData.games);
    }

    // Add counts from older archives (don't fetch PGNs)
    for (const archiveUrl of recentArchives.slice(0, -3)) {
      const monthData = await chessGet<MonthlyGames>(
        archiveUrl.replace(BASE, "")
      );
      gamesPlayed365d += monthData.games.length;
    }

    // Distinct ECO codes from last 50 games
    const ecoSet = new Set<string>();
    for (const game of last50Games.slice(-50)) {
      if (game.pgn) {
        const eco = extractECO(game.pgn);
        if (eco) ecoSet.add(eco);
      }
    }

    return [
      { userId, source: "chess_com", metric: "rapid_rating", value: rapidRating, unit: "elo" },
      { userId, source: "chess_com", metric: "blitz_rating", value: blitzRating, unit: "elo" },
      { userId, source: "chess_com", metric: "puzzle_rating", value: puzzleRating, unit: "elo" },
      { userId, source: "chess_com", metric: "win_rate_rapid", value: Math.round(winRateRapid * 10) / 10, unit: "percent" },
      {
        userId,
        source: "chess_com",
        metric: "games_played_365d",
        value: gamesPlayed365d,
        unit: "count",
        periodStart: oneYearAgo,
        periodEnd: new Date(),
      },
      { userId, source: "chess_com", metric: "openings_played", value: ecoSet.size, unit: "count" },
    ];
  },
};
