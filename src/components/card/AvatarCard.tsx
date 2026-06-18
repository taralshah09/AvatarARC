import React from 'react';
import { Avatar } from '@/types/avatar';
import { RadarHexagon } from './RadarHexagon';
import { getTheme, getThemeName } from './CardThemes';

interface AvatarCardProps {
  avatar: Avatar;
  onClick?: () => void;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, onClick }) => {
  const themeName = getThemeName(avatar.overall_score);
  const theme = getTheme(avatar.overall_score);

  return (
    <div 
      onClick={onClick}
      className={`
        relative w-72 h-[450px] rounded-2xl p-1 cursor-pointer
        transition-all duration-300 hover:scale-105 hover:z-10
        ${theme.glowClass}
      `}
    >
      <div className={`
        w-full h-full rounded-xl overflow-hidden
        bg-gradient-to-b from-slate-900 to-slate-950
        border-2 ${theme.borderClass}
        flex flex-col relative
      `}>
        
        {/* Header - Class & Name */}
        <div className="p-4 flex items-start justify-between border-b border-white/10 z-10">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{avatar.agent_class}</span>
            <span className="text-xl font-black text-white uppercase tracking-tight">{avatar.name}</span>
          </div>
          
          <div className="flex flex-col items-center shrink-0">
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-slate-800/80 backdrop-blur-sm shadow-lg shadow-black/20">
              <span className="text-xs text-slate-400 font-bold -mb-1">OVR</span>
              <span className={`text-lg font-black`} style={{ color: theme.accent }}>
                {avatar.overall_score !== null ? avatar.overall_score : '-'}
              </span>
            </div>
            {avatar.tier && (
              <div className="mt-1.5 flex flex-col items-center text-center leading-tight">
                <span className="text-[10px] uppercase font-bold tracking-widest drop-shadow-md" style={{ color: theme.accent }}>
                  {avatar.tier}
                </span>
                {avatar.tier_rank && (
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Rank #{avatar.tier_rank}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="flex-1 flex items-center justify-center relative p-4 z-10">
          {/* Subtle background glow behind radar */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: `radial-gradient(circle at center, ${theme.accent} 0%, transparent 70%)` 
            }}
          />
          <RadarHexagon 
            scores={avatar.scores} 
            size={220} 
            themeName={themeName} 
          />
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-md z-10">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">Origin</span>
              <span className="text-slate-300 truncate">{avatar.model || 'Unknown'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">Matches</span>
              <span className="text-slate-300">{avatar.stats?.matches_played || 0}</span>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl opacity-50 m-2 pointer-events-none" style={{ borderColor: theme.accent }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl opacity-50 m-2 pointer-events-none" style={{ borderColor: theme.accent }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl opacity-50 m-2 pointer-events-none" style={{ borderColor: theme.accent }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl opacity-50 m-2 pointer-events-none" style={{ borderColor: theme.accent }} />
      </div>
    </div>
  );
};
