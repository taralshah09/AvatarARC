import type { ProviderAdapter, Signal } from "./types";

const CF_BASE = "https://codeforces.com/api";

async function cfGet<T>(path: string): Promise<T> {
  const res = await fetch(`${CF_BASE}${path}`);
  if (!res.ok) throw new Error(`Codeforces error ${res.status}: ${path}`);
  const json = await res.json();
  if (json.status !== "OK") throw new Error(`Codeforces API: ${json.comment}`);
  return json.result as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface CFUser {
  rating: number;
  maxRating: number;
}

interface CFSubmission {
  verdict: string;
  creationTimeSeconds: number;
  problem: { rating?: number; name: string; contestId?: number };
}

interface CFRatingChange {
  ratingUpdateTimeSeconds: number;
}

export const codeforcesAdapter: ProviderAdapter = {
  source: "codeforces",

  // accessToken holds the Codeforces handle for public-API providers
  async fetchSignals(userId: string, accessToken: string): Promise<Signal[]> {
    const handle = accessToken;

    const [userInfo] = await cfGet<CFUser[]>(`/user.info?handles=${handle}`);
    await sleep(250);

    const submissions = await cfGet<CFSubmission[]>(`/user.status?handle=${handle}&from=1&count=10000`);
    await sleep(250);

    const ratingHistory = await cfGet<CFRatingChange[]>(`/user.rating?handle=${handle}`);

    const oneYearAgo = Date.now() / 1000 - 365 * 24 * 3600;

    // Unique solved problems in last 365 days (deduplicated by contestId+name)
    const solvedKeys = new Set<string>();
    let hardProblems = 0;
    for (const sub of submissions) {
      if (
        sub.verdict === "OK" &&
        sub.creationTimeSeconds >= oneYearAgo
      ) {
        const key = `${sub.problem.contestId ?? "x"}_${sub.problem.name}`;
        if (!solvedKeys.has(key)) {
          solvedKeys.add(key);
          if ((sub.problem.rating ?? 0) >= 1800) hardProblems++;
        }
      }
    }

    const contestCount365d = ratingHistory.filter(
      (r) => r.ratingUpdateTimeSeconds >= oneYearAgo
    ).length;

    return [
      { userId, source: "codeforces", metric: "cf_rating", value: userInfo.rating ?? 0, unit: "rating" },
      { userId, source: "codeforces", metric: "cf_max_rating", value: userInfo.maxRating ?? 0, unit: "rating" },
      { userId, source: "codeforces", metric: "problems_solved_365d", value: solvedKeys.size, unit: "count" },
      { userId, source: "codeforces", metric: "hard_problems_solved", value: hardProblems, unit: "count" },
      { userId, source: "codeforces", metric: "contest_count_365d", value: contestCount365d, unit: "count" },
    ];
  },
};
