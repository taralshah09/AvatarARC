import type { ProviderAdapter, Signal } from "./types";

const GH_GRAPHQL = "https://api.github.com/graphql";
const GH_REST = "https://api.github.com";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

async function ghGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(GH_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

async function ghRest<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${GH_REST}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`GitHub REST error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

function calcStreak(weeks: ContributionWeek[]): number {
  const days = weeks.flatMap((w) => w.contributionDays).reverse();
  let streak = 0;
  for (const day of days) {
    if (day.contributionCount > 0) streak++;
    else break;
  }
  return streak;
}

export const githubAdapter: ProviderAdapter = {
  source: "github",

  async fetchSignals(userId: string, accessToken: string): Promise<Signal[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const from = oneYearAgo.toISOString();
    const to = new Date().toISOString();

    // Contribution calendar + PR merged count via GraphQL
    const contribQuery = `
      query($from: DateTime!, $to: DateTime!) {
        viewer {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
            pullRequestContributionsByRepository {
              contributions {
                totalCount
              }
            }
          }
        }
      }
    `;

    const contribData = await ghGraphQL<{
      viewer: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: ContributionWeek[];
          };
          pullRequestContributionsByRepository: Array<{
            contributions: { totalCount: number };
          }>;
        };
      };
    }>(accessToken, contribQuery, { from, to });

    const calendar =
      contribData.viewer.contributionsCollection.contributionCalendar;
    const totalCommits = calendar.totalContributions;
    const streakDays = calcStreak(calendar.weeks);

    const prsMerged =
      contribData.viewer.contributionsCollection.pullRequestContributionsByRepository.reduce(
        (sum, r) => sum + r.contributions.totalCount,
        0
      );

    // Repos for language diversity
    const repos = await ghRest<
      Array<{ language: string | null; pushed_at: string }>
    >(accessToken, "/user/repos?per_page=100&sort=pushed&type=owner&visibility=public");

    const reposWithCommits = repos.filter((r) => r.language !== null).length;

    const languages = new Set(
      repos.map((r) => r.language).filter(Boolean)
    );

    const signals: Signal[] = [
      {
        userId,
        source: "github",
        metric: "commits_365d",
        value: totalCommits,
        unit: "count",
        periodStart: oneYearAgo,
        periodEnd: new Date(),
      },
      {
        userId,
        source: "github",
        metric: "current_streak_days",
        value: streakDays,
        unit: "days",
      },
      {
        userId,
        source: "github",
        metric: "repos_with_commits",
        value: reposWithCommits,
        unit: "count",
      },
      {
        userId,
        source: "github",
        metric: "languages_used",
        value: languages.size,
        unit: "count",
      },
      {
        userId,
        source: "github",
        metric: "pull_requests_merged_365d",
        value: prsMerged,
        unit: "count",
        periodStart: oneYearAgo,
        periodEnd: new Date(),
      },
    ];

    return signals;
  },
};
