import React from 'react';

interface SpellCircleProps {
  size?: number;
  glowColor?: 'cyan' | 'amber';
  animate?: boolean;
  className?: string;
}

const SpellCircle: React.FC<SpellCircleProps> = ({
  size = 200,
  glowColor = 'cyan',
  animate = true,
  className = '',
}) => {
  const glow = glowColor === 'cyan' ? 'var(--color-arcane-cyan)' : 'var(--color-arcane-amber)';
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={`relative ${className}`}
      style={{
        filter: `drop-shadow(0 0 8px ${glowColor === 'cyan' ? 'rgba(77,208,225,0.3)' : 'rgba(232,181,77,0.3)'})`
      }}
    >
      <g className={animate ? 'animate-rune-spin' : ''} style={{ animationDuration: '20s', transformOrigin: 'center' }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke={glow} strokeWidth="1" strokeDasharray="4 8" opacity="0.4" />
        <circle cx="100" cy="10" r="3" fill={glow} opacity="0.6" />
        <circle cx="100" cy="190" r="3" fill={glow} opacity="0.6" />
        <circle cx="10" cy="100" r="3" fill={glow} opacity="0.6" />
        <circle cx="190" cy="100" r="3" fill={glow} opacity="0.6" />
      </g>
      
      <g className={animate ? 'animate-rune-spin' : ''} style={{ animationDuration: '15s', animationDirection: 'reverse', transformOrigin: 'center' }}>
        <circle cx="100" cy="100" r="75" fill="none" stroke={glow} strokeWidth="1.5" opacity="0.5" />
        <path d="M 100 25 L 105 35 L 95 35 Z" fill={glow} opacity="0.7" />
        <path d="M 100 175 L 95 165 L 105 165 Z" fill={glow} opacity="0.7" />
      </g>
      
      <g className={animate ? 'animate-rune-spin' : ''} style={{ animationDuration: '30s', transformOrigin: 'center' }}>
        <circle cx="100" cy="100" r="60" fill="none" stroke={glow} strokeWidth="1" strokeDasharray="20 10 5 10" opacity="0.6" />
        <rect x="97" y="37" width="6" height="6" fill={glow} transform="rotate(45 100 40)" opacity="0.8" />
        <rect x="97" y="157" width="6" height="6" fill={glow} transform="rotate(45 100 160)" opacity="0.8" />
        <rect x="37" y="97" width="6" height="6" fill={glow} transform="rotate(45 40 100)" opacity="0.8" />
        <rect x="157" y="97" width="6" height="6" fill={glow} transform="rotate(45 160 100)" opacity="0.8" />
      </g>
    </svg>
  );
};

export default SpellCircle;
