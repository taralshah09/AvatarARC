import { AxisKey } from '@/components/card/RadarHexagon';

export interface AvatarStats {
  matches_played?: number;
  [key: string]: any;
}

export interface Avatar {
  id?: string;
  name: string;
  agent_class: string;
  overall_score: number | null;
  tier?: string;
  tier_rank?: number;
  model: string;
  scores: Partial<Record<AxisKey, number>>;
  stats?: AvatarStats;
}
