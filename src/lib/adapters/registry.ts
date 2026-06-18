import type { ProviderAdapter } from "./types";
import { githubAdapter } from "./github";
import { chessComAdapter } from "./chess-com";
import { stravaAdapter } from "./strava";
import { codeforcesAdapter } from "./codeforces";

export const adapterRegistry: Record<string, ProviderAdapter> = {
  github: githubAdapter,
  chess_com: chessComAdapter,
  strava: stravaAdapter,
  codeforces: codeforcesAdapter,
};
