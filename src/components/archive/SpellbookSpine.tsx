import { memo } from 'react';
import { motion } from 'motion/react';
import type { Collection } from '../../types/archive';

interface SpellbookSpineProps {
  collection: Collection;
  onSelect?: (collection: Collection) => void;
  className?: string;
}

/**
 * Color palettes for book spines — assigned by slug hash so each
 * collection gets a deterministic, unique visual identity.
 */
const bookPalettes = [
  { bg: 'from-[#1a2744] to-[#0f1a2e]', accent: '#7eb8da', glow: 'rgba(126,184,218,0.3)' },
  { bg: 'from-[#3d1a1a] to-[#2a1010]', accent: '#d4776b', glow: 'rgba(212,119,107,0.3)' },
  { bg: 'from-[#1a3028] to-[#0f1f1a]', accent: '#6ba88c', glow: 'rgba(107,168,140,0.3)' },
  { bg: 'from-[#2a1a3d] to-[#1a1028]', accent: '#9b7ec4', glow: 'rgba(155,126,196,0.3)' },
  { bg: 'from-[#3d2a1a] to-[#281a0f]', accent: '#c4a67e', glow: 'rgba(196,166,126,0.3)' },
  { bg: 'from-[#1a2a3d] to-[#0f1a28]', accent: '#7e9bc4', glow: 'rgba(126,155,196,0.3)' },
  { bg: 'from-[#3d2a1a] to-[#2a1a0f]', accent: '#e8b54d', glow: 'rgba(232,181,77,0.3)' },
  { bg: 'from-[#1f1f2e] to-[#141420]', accent: '#8888aa', glow: 'rgba(136,136,170,0.3)' },
  { bg: 'from-[#2a1a30] to-[#1a1020]', accent: '#c47eb8', glow: 'rgba(196,126,184,0.3)' },
  { bg: 'from-[#2a2a1a] to-[#1a1a0f]', accent: '#a89b7e', glow: 'rgba(168,155,126,0.3)' },
  { bg: 'from-[#1a3333] to-[#0f2020]', accent: '#5ea8a0', glow: 'rgba(94,168,160,0.3)' },
  { bg: 'from-[#3d2510] to-[#2a1a0a]', accent: '#d4956b', glow: 'rgba(212,149,107,0.3)' },
];

/**
 * Sigil shapes — each collection gets a unique one based on slug hash.
 */
const sigils = [
  // Concentric circles with cardinal lines
  (accent: string) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      <circle cx="20" cy="20" r="16" fill="none" stroke={accent} strokeWidth="0.8" />
      <circle cx="20" cy="20" r="10" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="3 4" />
      <circle cx="20" cy="20" r="3" fill={accent} opacity="0.6" />
      <line x1="20" y1="4" x2="20" y2="8" stroke={accent} strokeWidth="0.5" />
      <line x1="20" y1="32" x2="20" y2="36" stroke={accent} strokeWidth="0.5" />
      <line x1="4" y1="20" x2="8" y2="20" stroke={accent} strokeWidth="0.5" />
      <line x1="32" y1="20" x2="36" y2="20" stroke={accent} strokeWidth="0.5" />
    </svg>
  ),
  // Diamond with inner square
  (accent: string) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke={accent} strokeWidth="0.8" />
      <rect x="13" y="13" width="14" height="14" fill="none" stroke={accent} strokeWidth="0.5" />
      <circle cx="20" cy="20" r="2.5" fill={accent} opacity="0.5" />
    </svg>
  ),
  // Star burst
  (accent: string) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      {[0, 45, 90, 135].map(angle => (
        <line key={angle} x1="20" y1="6" x2="20" y2="34" stroke={accent} strokeWidth="0.5" opacity="0.6"
          transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="6" fill="none" stroke={accent} strokeWidth="0.7" />
      <circle cx="20" cy="20" r="2" fill={accent} opacity="0.5" />
    </svg>
  ),
  // Triangle triquetra
  (accent: string) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      <polygon points="20,5 35,32 5,32" fill="none" stroke={accent} strokeWidth="0.8" />
      <polygon points="20,35 5,8 35,8" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      <circle cx="20" cy="20" r="4" fill="none" stroke={accent} strokeWidth="0.6" />
      <circle cx="20" cy="20" r="1.5" fill={accent} opacity="0.5" />
    </svg>
  ),
  // Hexagonal pattern
  (accent: string) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill="none" stroke={accent} strokeWidth="0.8" />
      <polygon points="20,10 28,15 28,25 20,30 12,25 12,15" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="2 3" />
      <circle cx="20" cy="20" r="2" fill={accent} opacity="0.5" />
    </svg>
  ),
  // Crescent moon with stars
  (accent: string) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500">
      <circle cx="20" cy="20" r="14" fill="none" stroke={accent} strokeWidth="0.8" />
      <circle cx="25" cy="18" r="11" fill="var(--color-arcane-void, #0a0a0f)" stroke="none" />
      <circle cx="14" cy="14" r="1" fill={accent} opacity="0.5" />
      <circle cx="11" cy="22" r="0.7" fill={accent} opacity="0.4" />
      <circle cx="16" cy="30" r="0.8" fill={accent} opacity="0.3" />
    </svg>
  ),
];

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const SpellbookSpine = memo(function SpellbookSpine({ collection, onSelect, className = '' }: SpellbookSpineProps) {
  const hash = hashSlug(collection.slug);
  const palette = bookPalettes[hash % bookPalettes.length];
  const SigilFn = sigils[hash % sigils.length];

  const handleClick = () => {
    if (onSelect) onSelect(collection);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      className={`block group cursor-pointer outline-none ${className}`}
    >
      <motion.div
        whileHover={{ y: -12, rotateZ: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        {/* Book body */}
        <div
          className={`relative bg-gradient-to-b ${palette.bg} rounded-sm border border-white/10 overflow-hidden w-[100px] h-[150px] md:w-[140px] md:h-[200px]`}
          style={{
            boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.4), inset 3px 0 6px rgba(255,255,255,0.03), 4px 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Spine ridges */}
          <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-white/10 via-transparent to-white/5" />
          <div className="absolute inset-y-0 right-0 w-[2px] bg-black/30" />

          {/* Top decorative band */}
          <div className="absolute top-3 left-2 right-2 h-[1px]" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />
          <div className="absolute top-5 left-3 right-3 h-[1px]" style={{ backgroundColor: palette.accent, opacity: 0.3 }} />

          {/* Central emblem */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {SigilFn(palette.accent)}
          </div>

          {/* Volume number */}
          <div 
            className="absolute top-8 left-1/2 -translate-x-1/2 font-heading text-[10px] tracking-[0.3em] uppercase"
            style={{ color: palette.accent, opacity: 0.7 }}
          >
            VOL {collection.volumeNumber || '?'}
          </div>

          {/* Title */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-3">
            <p 
              className="font-heading text-[10px] text-center leading-tight tracking-[0.1em] line-clamp-3"
              style={{ color: palette.accent }}
            >
              {collection.title}
            </p>
          </div>

          {/* Bottom decorative band */}
          <div className="absolute bottom-3 left-2 right-2 h-[1px]" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />

          {/* Hover glow */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: `inset 0 0 30px ${palette.glow}, 0 0 20px ${palette.glow}` }}
          />
        </div>

        {/* Pages side edge */}
        <div 
          className="absolute top-[2px] -right-[4px] w-[4px] h-[calc(100%-4px)] rounded-r-sm"
          style={{ 
            background: 'linear-gradient(to right, rgba(200,190,170,0.3), rgba(200,190,170,0.1))',
          }}
        />
      </motion.div>
    </div>
  );
});

export default SpellbookSpine;
