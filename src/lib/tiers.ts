export type Tier = 'standard' | 'rare' | 'epic' | 'legendary';

export function getTierColors(tier: Tier) {
  switch (tier) {
    case 'legendary':
      return {
        border: '#facc15', // yellow-400
        bgFrom: '#713f12', // yellow-900
        bgTo: '#854d0e', // yellow-800
        glow: 'rgba(234,179,8,0.8)',
      };
    case 'epic':
      return {
        border: '#a855f7', // purple-500
        bgFrom: '#581c87', // purple-900
        bgTo: '#6b21a8', // purple-800
        glow: 'rgba(168,85,247,0.6)',
      };
    case 'rare':
      return {
        border: '#3b82f6', // blue-500
        bgFrom: '#1e3a8a', // blue-900
        bgTo: '#1e40af', // blue-800
        glow: 'rgba(59,130,246,0.5)',
      };
    case 'standard':
    default:
      return {
        border: '#374151', // gray-700
        bgFrom: '#111827', // gray-900
        bgTo: '#1f2937', // gray-800
        glow: 'transparent',
      };
  }
}
