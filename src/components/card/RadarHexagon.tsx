import React from 'react';
import { THEMES } from './CardThemes';

export type AxisKey = 'VIT' | 'STR' | 'CRA' | 'GRT' | 'DIS' | 'LOG';

interface RadarHexagonProps {
  scores: Partial<Record<AxisKey, number>>;
  size?: number;
  themeName?: 'standard' | 'rare' | 'legendary';
}

export const RadarHexagon: React.FC<RadarHexagonProps> = ({ 
  scores, 
  size = 200,
  themeName = 'standard' 
}) => {
  const radius = size / 2;
  const center = { x: radius, y: radius };
  
  // Outer radius with a little padding for labels
  const hexRadius = radius * 0.75; 
  
  // Angle for each axis (starting top, going clockwise)
  const angles = [
    -Math.PI / 2,                  // Top
    -Math.PI / 6,                  // Top Right
    Math.PI / 6,                   // Bottom Right
    Math.PI / 2,                   // Bottom
    Math.PI - Math.PI / 6,         // Bottom Left
    Math.PI + Math.PI / 6,         // Top Left
  ];
  
  const axes: AxisKey[] = ['VIT', 'STR', 'CRA', 'GRT', 'DIS', 'LOG'];
  
  const getPoint = (angle: number, r: number) => {
    return {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle)
    };
  };

  const getPointsString = (radii: number[]) => {
    return radii.map((r, i) => {
      const p = getPoint(angles[i], r);
      return `${p.x},${p.y}`;
    }).join(' ');
  };

  const outerPoints = getPointsString(Array(6).fill(hexRadius));
  const innerPoints = getPointsString(Array(6).fill(hexRadius * 0.5));
  
  const valuePoints = getPointsString(
    axes.map((axis, i) => {
      const score = scores[axis];
      if (score === undefined || score === null) return 0; // vertex at center
      return (score / 100) * hexRadius;
    })
  );

  const theme = THEMES[themeName];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background hexagons */}
      <polygon points={outerPoints} fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
      <polygon points={innerPoints} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
      
      {/* Axes lines */}
      {angles.map((angle, i) => {
        const end = getPoint(angle, hexRadius);
        return (
          <line 
            key={`axis-${i}`} 
            x1={center.x} y1={center.y} 
            x2={end.x} y2={end.y} 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="1" 
          />
        );
      })}

      {/* Value polygon */}
      <polygon 
        points={valuePoints} 
        fill={theme.radarFill} 
        stroke={theme.radarStroke} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />

      {/* Axis labels */}
      {axes.map((axis, i) => {
        const labelPos = getPoint(angles[i], hexRadius + 20); // slightly outside
        
        let textAnchor: "middle" | "start" | "end" = "middle";
        if (i === 1 || i === 2) textAnchor = "start";
        if (i === 4 || i === 5) textAnchor = "end";
        
        const score = scores[axis];
        const displayScore = score !== undefined && score !== null ? score : '-';
        
        let dy = "0.3em";
        if (i === 0) dy = "-0.2em";
        if (i === 3) dy = "0.8em";
        
        return (
          <g key={`label-${i}`} transform={`translate(${labelPos.x}, ${labelPos.y})`}>
            <text 
              textAnchor={textAnchor} 
              dy={dy}
              fill="rgba(255, 255, 255, 0.7)" 
              fontSize="12"
              fontWeight="bold"
            >
              {axis} <tspan fill="white">{displayScore}</tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
};
