interface RuneDividerProps {
  variant?: 'simple' | 'ornate';
  glowColor?: 'cyan' | 'amber';
  className?: string;
}

export default function RuneDivider({
  variant = 'simple',
  glowColor = 'cyan',
  className = '',
}: RuneDividerProps) {
  const color = glowColor === 'cyan' ? 'var(--color-arcane-cyan)' : 'var(--color-arcane-amber)';
  const glowRgba = glowColor === 'cyan' ? 'rgba(77,208,225,0.3)' : 'rgba(232,181,77,0.3)';

  return (
    <div className={`flex items-center justify-center w-full gap-4 ${className}`}>
      {/* Left line */}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-arcane-border" />
      
      {variant === 'simple' ? (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-6 h-6 rounded-full animate-glow-pulse opacity-50" style={{ backgroundColor: glowRgba, filter: 'blur(6px)' }} />
          <svg width="16" height="16" viewBox="0 0 16 16" className="relative">
            <rect x="8" y="1.5" width="9" height="9" fill="none" stroke={color} strokeWidth="1.2" transform="rotate(45 8 8)" />
            <circle cx="8" cy="8" r="1.5" fill={color} />
          </svg>
        </div>
      ) : (
        <div className="relative flex items-center gap-3">
          <div className="absolute inset-x-[-8px] inset-y-[-4px] animate-glow-pulse opacity-40" style={{ backgroundColor: glowRgba, filter: 'blur(10px)', borderRadius: '50%' }} />
          
          <svg width="12" height="12" viewBox="0 0 12 12" className="relative opacity-60">
            <rect x="6" y="0.5" width="7.5" height="7.5" fill="none" stroke={color} strokeWidth="1" transform="rotate(45 6 6)" />
          </svg>
          
          <svg width="80" height="20" viewBox="0 0 80 20" className="relative">
            <path d="M 0 10 Q 20 2, 40 10 Q 60 18, 80 10" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
            <path d="M 0 10 Q 20 18, 40 10 Q 60 2, 80 10" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
            <circle cx="40" cy="10" r="4" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="40" cy="10" r="1.5" fill={color} />
          </svg>
          
          <svg width="12" height="12" viewBox="0 0 12 12" className="relative opacity-60">
            <rect x="6" y="0.5" width="7.5" height="7.5" fill="none" stroke={color} strokeWidth="1" transform="rotate(45 6 6)" />
          </svg>
        </div>
      )}
      
      {/* Right line */}
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-arcane-border" />
    </div>
  );
}
