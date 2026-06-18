import type { ProviderAdapter, Signal } from "./types";
import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/utils/encryption";

const STRAVA_BASE = "https://www.strava.com/api/v3";

interface StravaActivity {
  type: string;
  distance: number;      // meters
  moving_time: number;   // seconds
  total_elevation_gain: number; // meters
  start_date: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function refreshStravaToken(
  userId: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);
  const data = (await res.json()) as TokenResponse;

  await prisma.connectedProvider.update({
    where: { userId_provider: { userId, provider: "strava" } },
    data: {
      accessToken: encrypt(data.access_token),
      refreshToken: encrypt(data.refresh_token),
      tokenExpiresAt: new Date(data.expires_at * 1000),
    },
  });

  return data.access_token;
}

function calcWorkoutStreak(activities: StravaActivity[]): number {
  const activeDates = new Set(
    activities.map((a) => a.start_date.split("T")[0])
  );
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (activeDates.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export const stravaAdapter: ProviderAdapter = {
  source: "strava",

  async fetchSignals(userId: string, accessToken: string): Promise<Signal[]> {
    const provider = await prisma.connectedProvider.findUnique({
      where: { userId_provider: { userId, provider: "strava" } },
    });

    let token = accessToken;
    if (
      provider?.tokenExpiresAt &&
      provider.tokenExpiresAt < new Date() &&
      provider.refreshToken
    ) {
      const { decrypt } = await import("@/lib/utils/encryption");
      token = await refreshStravaToken(userId, decrypt(provider.refreshToken));
    }

    const after = Math.floor(Date.now() / 1000 - 365 * 24 * 3600);
    const activities: StravaActivity[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `${STRAVA_BASE}/athlete/activities?after=${after}&per_page=200&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Strava activities error: ${res.status}`);
      const batch = (await res.json()) as StravaActivity[];
      if (batch.length === 0) break;
      activities.push(...batch);
      if (batch.length < 200) break;
      page++;
    }

    const totalDistanceKm = activities.reduce((s, a) => s + a.distance / 1000, 0);
    const totalActivities = activities.length;

    const runs = activities.filter((a) => a.type === "Run");
    const avgPacePerKm =
      runs.length > 0
        ? runs.reduce((s, a) => {
            const km = a.distance / 1000;
            return s + (km > 0 ? a.moving_time / km : 0);
          }, 0) / runs.length
        : 0;

    const maxElevation = activities.reduce(
      (max, a) => Math.max(max, a.total_elevation_gain),
      0
    );

    const streakDays = calcWorkoutStreak(activities);
    const weeklyFrequency = totalActivities / 52;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return [
      {
        userId, source: "strava", metric: "total_distance_km_365d",
        value: Math.round(totalDistanceKm * 10) / 10, unit: "km",
        periodStart: oneYearAgo, periodEnd: new Date(),
      },
      {
        userId, source: "strava", metric: "total_activities_365d",
        value: totalActivities, unit: "count",
        periodStart: oneYearAgo, periodEnd: new Date(),
      },
      {
        userId, source: "strava", metric: "avg_pace_per_km",
        value: Math.round(avgPacePerKm), unit: "seconds",
      },
      {
        userId, source: "strava", metric: "max_elevation_gain_m",
        value: Math.round(maxElevation), unit: "meters",
      },
      {
        userId, source: "strava", metric: "workout_streak_days",
        value: streakDays, unit: "days",
      },
      {
        userId, source: "strava", metric: "weekly_activity_frequency",
        value: Math.round(weeklyFrequency * 10) / 10, unit: "count",
      },
    ];
  },
};
