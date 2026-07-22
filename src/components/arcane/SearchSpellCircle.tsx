import { memo, useMemo } from 'react';

interface SearchSpellCircleProps {
  /** Number of characters typed — controls how many rings/runes appear */
  charCount: number;
  size?: number;
  className?: string;
}

/**
 * A spell circle for the search bar that grows more complex as the user types.
 * Starts as a simple ring, gains inner rings, runes, and glyphs with each character.
 */
const SearchSpellCircle = memo(function SearchSpellCircle({ 
  charCount, size = 24, className = '' 
}: SearchSpellCircleProps) {
  const intensity = Math.min(charCount, 20); // cap complexity
  const glow = 'var(--color-arcane-cyan)';
  const amber = 'var(--color-arcane-amber)';

  // Generate rune marks based on character count
  const runeMarks = useMemo(() => {
    const marks: { angle: number; type: 'dot' | 'diamond' | 'tick' | 'glyph'; ring: number }[] = [];
    for (let i = 0; i < Math.min(charCount, 16); i++) {
      const angle = (i * 137.5) % 360; // golden angle for nice distribution
      const type = i % 4 === 0 ? 'diamond' : i % 3 === 0 ? 'glyph' : i % 2 === 0 ? 'tick' : 'dot';
      const ring = i < 6 ? 0 : i < 12 ? 1 : 2;
      marks.push({ angle, type, ring });
    }
    return marks;
  }, [charCount]);

  const ringRadii = [38, 28, 18];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className}`}
      style={{
        filter: intensity > 0
          ? `drop-shadow(0 0 ${3 + intensity * 0.5}px rgba(77,208,225,${0.2 + intensity * 0.03}))`
          : 'none',
      }}
    >
      {/* Outer ring — always visible, spins slowly */}
      <g style={{ animation: 'spin 12s linear infinite', transformOrigin: 'center' }}>
        <circle
          cx="50" cy="50" r="44"
          fill="none" stroke={glow}
          strokeWidth={intensity > 0 ? 1.2 : 0.8}
          strokeDasharray={intensity > 3 ? '6 4 2 4' : '3 6'}
          opacity={0.5 + intensity * 0.025}
        />
        {/* Cardinal dots on outer ring */}
        {intensity > 0 && <>
          <circle cx="50" cy="6" r="1.5" fill={glow} opacity="0.7" />
          <circle cx="50" cy="94" r="1.5" fill={glow} opacity="0.7" />
          <circle cx="6" cy="50" r="1.5" fill={glow} opacity="0.7" />
          <circle cx="94" cy="50" r="1.5" fill={glow} opacity="0.7" />
        </>}
      </g>

      {/* Second ring — appears at 3+ chars, counter-spins */}
      {intensity >= 3 && (
        <g style={{ animation: 'spin 8s linear infinite reverse', transformOrigin: 'center' }}>
          <circle
            cx="50" cy="50" r="34"
            fill="none" stroke={glow}
            strokeWidth="1"
            strokeDasharray="12 6 3 6"
            opacity={0.4 + (intensity - 3) * 0.03}
          />
        </g>
      )}

      {/* Third ring — appears at 8+ chars */}
      {intensity >= 8 && (
        <g style={{ animation: 'spin 20s linear infinite', transformOrigin: 'center' }}>
          <circle
            cx="50" cy="50" r="24"
            fill="none" stroke={amber}
            strokeWidth="0.8"
            strokeDasharray="4 8"
            opacity={0.3 + (intensity - 8) * 0.04}
          />
        </g>
      )}

      {/* Inner glow core — appears at 5+ chars */}
      {intensity >= 5 && (
        <circle
          cx="50" cy="50" r={4 + Math.min(intensity - 5, 8) * 0.5}
          fill="none"
          stroke={glow}
          strokeWidth="0.6"
          opacity={0.3}
        />
      )}

      {/* Rune marks — each character adds one */}
      <g style={{ animation: 'spin 25s linear infinite reverse', transformOrigin: 'center' }}>
        {runeMarks.map((mark, i) => {
          const r = ringRadii[mark.ring] || 38;
          const rad = (mark.angle * Math.PI) / 180;
          const x = 50 + r * Math.cos(rad);
          const y = 50 + r * Math.sin(rad);

          if (mark.type === 'dot') {
            return <circle key={i} cx={x} cy={y} r="1.2" fill={glow} opacity="0.8" />;
          }
          if (mark.type === 'diamond') {
            return (
              <rect key={i} x={x - 1.5} y={y - 1.5} width="3" height="3"
                fill={amber} opacity="0.8"
                transform={`rotate(45 ${x} ${y})`}
              />
            );
          }
          if (mark.type === 'tick') {
            const endX = 50 + (r + 4) * Math.cos(rad);
            const endY = 50 + (r + 4) * Math.sin(rad);
            return (
              <line key={i} x1={x} y1={y} x2={endX} y2={endY}
                stroke={glow} strokeWidth="0.8" opacity="0.6"
              />
            );
          }
          // glyph — small triangle
          const s = 2.5;
          return (
            <polygon key={i}
              points={`${x},${y - s} ${x - s * 0.866},${y + s * 0.5} ${x + s * 0.866},${y + s * 0.5}`}
              fill={amber} opacity="0.6"
            />
          );
        })}
      </g>

      {/* Center dot — always present */}
      <circle cx="50" cy="50" r={1 + intensity * 0.15} fill={glow} opacity={0.4 + intensity * 0.03} />
    </svg>
  );
});

export default SearchSpellCircle;
