export interface Signal {
  userId: string;
  source:
    | "github"
    | "chess_com"
    | "lichess"
    | "strava"
    | "codeforces"
    | "google_health";
  metric: string;
  value: number;
  unit: string;
  periodStart?: Date;
  periodEnd?: Date;
  rawPayload?: object;
}

export interface ProviderAdapter {
  source: Signal["source"];
  fetchSignals(userId: string, accessToken: string): Promise<Signal[]>;
}
