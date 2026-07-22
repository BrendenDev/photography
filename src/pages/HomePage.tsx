import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import SpellbookSpine from '../components/archive/SpellbookSpine';
import OpenBook from '../components/archive/OpenBook';
import SpellCircle from '../components/arcane/SpellCircle';
import SearchSpellCircle from '../components/arcane/SearchSpellCircle';
import { loadCollections } from '../lib/archive';
import type { Collection } from '../types/archive';

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCollection, setOpenCollection] = useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Capture initial book slug for deep-linking (one-shot, not reactive)
  const initialBookSlug = useRef(searchParams.get('book'));

  useEffect(() => {
    loadCollections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-open book from URL on initial load only
  useEffect(() => {
    if (initialBookSlug.current && collections.length > 0) {
      const found = collections.find(c => c.slug === initialBookSlug.current);
      if (found) setOpenCollection(found);
      initialBookSlug.current = null;
    }
  }, [collections]);

  const handleSelect = useCallback((c: Collection) => setOpenCollection(c), []);
  const handleClose = useCallback(() => {
    setOpenCollection(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Fuzzy search
  const fuse = useMemo(() => new Fuse(collections, {
    keys: ['title', 'description', 'tags', 'location', 'story'],
    threshold: 0.4,
  }), [collections]);

  // Set of matching slugs (empty query = everything matches)
  const matchingSlugs = useMemo(() => {
    if (!searchQuery.trim()) return null; // null = show all
    const results = fuse.search(searchQuery);
    return new Set(results.map(r => r.item.slug));
  }, [searchQuery, fuse]);

  // Keyboard shortcut: / to open search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-arcane-void flex flex-col items-center justify-center">
        <SpellCircle size={80} glowColor="amber" animate={true} />
        <p className="mt-6 font-heading text-sm text-arcane-amber animate-pulse tracking-[0.2em]">
          Opening the Archive...
        </p>
      </div>
    );
  }

  // Always build the same 5 shelves — filtering happens per-book
  const shelfRows = buildShelfRows(collections, 5);

  const matchCount = matchingSlugs ? matchingSlugs.size : collections.length;

  return (
    <div className="w-full min-h-screen bg-arcane-void">
      <div
        className="relative w-full min-h-screen"
        style={{
          background: `linear-gradient(180deg, 
            rgba(15,10,8,0.95) 0%, 
            rgba(20,14,10,0.9) 20%, 
            rgba(25,18,12,0.85) 50%, 
            rgba(20,14,10,0.9) 80%, 
            rgba(15,10,8,0.95) 100%
          )`,
        }}
      >
        {/* Wall texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)`,
          }}
        />

        {/* Ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center top, rgba(232,181,77,0.06) 0%, transparent 70%)' }}
        />

        {/* Title plaque + search */}
        <div className="relative pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-block px-8 py-3 relative">
              <div 
                className="absolute inset-0 rounded-sm"
                style={{
                  background: 'linear-gradient(180deg, #3d2b1f 0%, #2a1a12 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
                  border: '1px solid rgba(232,181,77,0.15)',
                }}
              />
              <h1 className="relative font-display text-xl md:text-2xl text-arcane-brass/80 tracking-[0.15em]">
                Brenden's Archive
              </h1>
            </div>
          </motion.div>

          {/* Expandable search bar */}
          <div className="flex justify-center mt-4">
            <motion.div
              animate={{ width: searchOpen ? 360 : 40 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-10 cursor-pointer"
              onClick={() => { if (!searchOpen) setSearchOpen(true); }}
              onBlur={(e) => {
                // Close if clicking outside and search is empty
                if (!e.currentTarget.contains(e.relatedTarget) && !searchQuery.trim()) {
                  setSearchOpen(false);
                }
              }}
            >
              {/* Background — idle circle or expanded pill */}
              <div
                className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                  searchOpen 
                    ? 'bg-arcane-surface/80 backdrop-blur-sm border border-arcane-border/60' 
                    : 'bg-arcane-surface/50 border border-arcane-border/30 hover:border-arcane-cyan/30'
                }`}
              />

              {/* Spell circle — always positioned left inside the bar */}
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <SearchSpellCircle charCount={searchQuery.length} size={28} />
              </div>

              {/* Input — only rendered when open */}
              {searchOpen && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  autoFocus
                  className="absolute inset-0 bg-transparent text-arcane-parchment pl-11 pr-4 rounded-full text-sm font-body placeholder:text-arcane-muted/60 focus:outline-none"
                />
              )}

              {/* Result count badge */}
              {searchOpen && searchQuery.trim() && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-heading text-arcane-muted/60 tracking-wider whitespace-nowrap">
                  {matchCount} volume{matchCount !== 1 ? 's' : ''}
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Shelves — always all 5, books animate individually */}
        <div className="relative max-w-6xl mx-auto px-2 md:px-4 pb-8">
          {shelfRows.map((row, rowIndex) => (
            <motion.div
              key={`shelf-${rowIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * rowIndex }}
            >
              <Shelf 
                collections={row.books} 
                onSelect={handleSelect}
                label={row.label}
                hasCandle={rowIndex === 0 || rowIndex === 2}
                matchingSlugs={matchingSlugs}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {openCollection && <OpenBook collection={openCollection} onClose={handleClose} />}
    </div>
  );
}

/** Individual shelf row — books animate in/out based on search */
function Shelf({ collections, onSelect, label, hasCandle, matchingSlugs }: { 
  collections: Collection[]; 
  onSelect: (c: Collection) => void;
  label?: string;
  hasCandle?: boolean;
  matchingSlugs: Set<string> | null;
}) {
  return (
    <div className="relative mb-2">
      {label && (
        <div className="absolute -top-3 left-8 z-10">
          <span 
            className="font-heading text-[8px] tracking-[0.3em] uppercase px-2 py-0.5 rounded-sm"
            style={{
              color: 'rgba(232,181,77,0.6)',
              background: 'rgba(30,20,14,0.8)',
              border: '1px solid rgba(232,181,77,0.12)',
            }}
          >
            {label}
          </span>
        </div>
      )}

      <div className="relative">
        {/* Back wall */}
        <div 
          className="absolute inset-x-0 top-0 bottom-3 rounded-t-sm"
          style={{
            background: 'linear-gradient(180deg, rgba(20,14,10,0.9) 0%, rgba(15,10,6,0.95) 100%)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)',
          }}
        />
        
        {/* Books */}
        <div className="relative flex items-end gap-2 md:gap-3 px-3 md:px-6 pb-0 pt-3 min-h-[165px] md:min-h-[210px] overflow-x-auto scrollbar-hide">
          {hasCandle && (
            <div 
              className="absolute top-1 left-3 w-12 h-12 rounded-full animate-flicker pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(232,181,77,0.12) 0%, transparent 70%)' }}
            />
          )}

          {collections.map((collection, i) => {
            const isVisible = matchingSlugs === null || matchingSlugs.has(collection.slug);
            return (
              <motion.div
                key={`${collection.slug}-${i}`}
                animate={isVisible
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.6, y: -60 }
                }
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ 
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                <SpellbookSpine
                  collection={collection}
                  onSelect={onSelect}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Shelf plank */}
        <div 
          className="relative h-3 md:h-4 rounded-b-sm"
          style={{
            background: 'linear-gradient(180deg, #5c3d2e 0%, #3d2b1f 40%, #2a1a12 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          <div className="absolute inset-0 opacity-15" 
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 20px)',
            }}
          />
        </div>

        {/* Shelf brackets */}
        <div className="absolute -bottom-1 left-5 w-2 h-1.5 bg-black/25 rounded-b-sm" />
        <div className="absolute -bottom-1 right-5 w-2 h-1.5 bg-black/25 rounded-b-sm" />
      </div>
    </div>
  );
}

function buildShelfRows(collections: Collection[], targetRows: number) {
  if (collections.length === 0) return [];
  const rows: { books: Collection[]; label?: string }[] = [];
  
  const featured = collections.filter(c => c.featured);
  if (featured.length > 0) rows.push({ books: featured, label: '✦ Featured' });
  rows.push({ books: collections, label: 'All Volumes' });

  const fill = [...collections].reverse();
  while (rows.length < targetRows) {
    const n = rows.length;
    if (n === 2) rows.push({ books: [...collections, ...fill].slice(0, 6) });
    else if (n === 3) rows.push({ books: [...fill, ...collections].slice(0, 5) });
    else rows.push({ books: [...collections, ...fill, ...collections].slice(0, 4) });
  }
  return rows;
}
