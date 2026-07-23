import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import type { Collection, Photo } from '../../types/archive';
import { loadPhotos } from '../../lib/archive';
import SpellCircle from '../arcane/SpellCircle';
import ProgressiveImage from '../ui/ProgressiveImage';

interface OpenBookProps {
  collection: Collection;
  onClose: () => void;
  /** Ordered list of collections available for navigation (respects search filter) */
  allCollections?: Collection[];
  /** Called when user navigates to a different collection */
  onSwitchCollection?: (collection: Collection, direction: 'next' | 'prev') => void;
  /** If true, start at the last photo instead of the title page */
  startAtEnd?: boolean;
}

export default function OpenBook({ collection, onClose, allCollections, onSwitchCollection, startAtEnd }: OpenBookProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for page index — only read from URL if the book param matches this collection
  // -2 = "pending jump to end" (shows loading, no title page flicker)
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (startAtEnd) return -2; // Will be set to last photo once loaded
    const bookParam = searchParams.get('book');
    if (bookParam !== collection.slug) return -1;
    const p = searchParams.get('p');
    if (p === null) return -1;
    const n = parseInt(p, 10);
    return isNaN(n) ? -1 : n;
  });


  useEffect(() => {
    loadPhotos(collection.slug)
      .then(p => {
        setPhotos(p);
        // If navigating backwards, jump directly to last photo (no animation)
        if (startAtEnd && p.length > 0) {
          setCurrentIndex(p.length - 1);
          setSearchParams({ book: collection.slug, p: String(p.length - 1) }, { replace: true });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collection.slug]);

  // Sync URL when book opens (set ?book= if not already set)
  useEffect(() => {
    if (searchParams.get('book') !== collection.slug) {
      setSearchParams({ book: collection.slug }, { replace: true });
    }
  }, [collection.slug]);

  const totalPages = photos.length;
  const hasNext = currentIndex < totalPages - 1;
  const hasPrev = currentIndex > -1;

  // Collection navigation
  const collectionIndex = allCollections?.findIndex(c => c.slug === collection.slug) ?? -1;
  const prevCollection = collectionIndex > 0 ? allCollections![collectionIndex - 1] : null;
  const nextCollection = allCollections && collectionIndex >= 0 && collectionIndex < allCollections.length - 1
    ? allCollections[collectionIndex + 1] : null;
  const canGoPrevCollection = !!prevCollection && !!onSwitchCollection;
  const canGoNextCollection = !!nextCollection && !!onSwitchCollection;

  const goTo = useCallback((index: number) => {
    setShowInfo(false);
    setCurrentIndex(index);
    if (index === -1) {
      setSearchParams({ book: collection.slug }, { replace: true });
    } else {
      setSearchParams({ book: collection.slug, p: String(index) }, { replace: true });
    }
  }, [collection.slug, setSearchParams]);

  const goNext = useCallback(() => {
    if (hasNext) { goTo(currentIndex + 1); }
    else if (nextCollection && onSwitchCollection) { onSwitchCollection(nextCollection, 'next'); }
  }, [hasNext, currentIndex, goTo, nextCollection, onSwitchCollection]);

  const goPrev = useCallback(() => {
    if (hasPrev) { goTo(currentIndex - 1); }
    else if (prevCollection && onSwitchCollection) { onSwitchCollection(prevCollection, 'prev'); }
  }, [hasPrev, currentIndex, goTo, prevCollection, onSwitchCollection]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (showInfo) setShowInfo(false); else handleClose(); }
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'i' || e.key === 'I') setShowInfo(s => !s);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose, goNext, goPrev, showInfo]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  // Auto-hide controls after 3s on photo pages
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // Reset timer on page change
  useEffect(() => {
    if (currentIndex >= 0) resetControlsTimer();
    else setShowControls(true); // Always show on title page
  }, [currentIndex]);

  const handlePhotoTap = useCallback(() => {
    if (showInfo) { setShowInfo(false); return; }
    setShowControls(s => !s);
    if (!showControls) resetControlsTimer();
  }, [showInfo, showControls, resetControlsTimer]);

  const currentPhoto = currentIndex >= 0 && currentIndex < photos.length ? photos[currentIndex] : null;
  const coverUrl = '';

  // Preload adjacent photos
  useEffect(() => {
    for (const offset of [1, -1, 2]) {
      const idx = currentIndex + offset;
      if (idx >= 0 && idx < photos.length) {
        const url = photos[idx].variants?.lg;
        if (url) { const img = new Image(); img.src = url; }
      }
    }
  }, [currentIndex, photos]);

  // Fade through darkness — pages dissolve into shadow and re-emerge
  const pageVariants = useMemo(() => ({
    enter: { opacity: 0, scale: 0.97, filter: 'brightness(0.3)' },
    center: { opacity: 1, scale: 1, filter: 'brightness(1)' },
    exit: { opacity: 0, scale: 0.97, filter: 'brightness(0.3)' },
  }), []);

  const pageTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/90"
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Book container — full screen on mobile, constrained on desktop */}
      <motion.div
        className="relative z-10 w-screen h-[100dvh] md:w-[95vw] md:max-w-[1200px] md:h-[88vh] md:max-h-[800px] flex rounded-none md:rounded-lg overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.1)' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 50) { dx < 0 ? goNext() : goPrev(); }
        }}
      >
          <AnimatePresence mode="wait" initial={false}>
            {currentIndex === -2 ? (
              /* PENDING: waiting for photos to load before jumping to end */
              <div key="pending-load" className="flex items-center justify-center w-full h-full bg-arcane-void">
                <SpellCircle size={80} glowColor="amber" animate={true} />
              </div>
            ) : currentIndex === -1 ? (
              /* TITLE PAGE */
              <motion.div
                key="title-spread"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className="flex flex-col md:flex-row w-full h-full"
              >
                {/* Left — scrollable photo grid */}
                <div className="h-[35%] md:h-full md:flex-1 relative overflow-y-auto" style={{ background: '#111115' }}>
                  {!loading && photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 p-0.5">
                      {photos.map((photo, i) => (
                        <button
                          key={photo.slug || i}
                          onClick={() => goTo(i)}
                          className="relative aspect-square overflow-hidden group"
                        >
                          <ProgressiveImage
                            src={photo.variants?.thumb || photo.variants?.lg || ''}
                            alt={photo.altText || photo.title || ''}
                            className="w-full h-full"
                            fit="cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 w-full">
                              <p className="font-heading text-[9px] text-white tracking-wider truncate">{photo.title}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SpellCircle size={80} glowColor="amber" animate={true} />
                    </div>
                  ) : coverUrl ? (
                    <>
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverUrl})` }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-arcane-deep to-arcane-void">
                      <SpellCircle size={150} glowColor="amber" animate={true} />
                    </div>
                  )}
                </div>

                {/* Right — collection info */}
                <div 
                  className="flex-1 relative overflow-hidden overflow-y-auto"
                  style={{
                    background: 'linear-gradient(135deg, #f5f0e6 0%, #efe8d8 50%, #e8dcc8 100%)',
                    boxShadow: 'inset 4px 0 15px rgba(0,0,0,0.15)',
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'1\' height=\'1\' fill=\'%23000\'/%3E%3C/svg%3E")' }} />
                  
                  <div className="flex flex-col justify-center items-center h-full p-8 text-center">
                    <span className="font-heading text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-4">
                      Volume {collection.volumeNumber}
                    </span>
                    
                    <h2 className="font-heading text-2xl md:text-4xl text-stone-800 tracking-wider mb-4 leading-tight">
                      {collection.title}
                    </h2>
                    
                    <svg viewBox="0 0 120 8" className="w-24 my-4">
                      <line x1="0" y1="4" x2="48" y2="4" stroke="#7eb8da" strokeWidth="0.5" opacity="0.4" />
                      <circle cx="60" cy="4" r="2.5" fill="none" stroke="#7eb8da" strokeWidth="0.7" opacity="0.5" />
                      <circle cx="60" cy="4" r="1" fill="#7eb8da" opacity="0.4" />
                      <line x1="72" y1="4" x2="120" y2="4" stroke="#7eb8da" strokeWidth="0.5" opacity="0.4" />
                    </svg>
                    
                    {collection.description && (
                      <p className="font-body text-sm text-stone-500 max-w-sm leading-relaxed mb-4 italic">
                        {collection.description}
                      </p>
                    )}
                    
                    {collection.story && (
                      <p className="font-body text-xs text-stone-400 max-w-sm leading-relaxed mb-6">
                        {collection.story}
                      </p>
                    )}

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {collection.tags?.map((tag: string) => (
                        <span key={tag} className="text-[9px] tracking-[0.15em] uppercase text-stone-400 border border-stone-300 px-2 py-0.5 rounded-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[10px] text-stone-400 mb-6">
                      {collection.location} · {photos.length} memories
                    </p>

                    {loading ? (
                      <p className="text-xs text-stone-400 italic animate-pulse">Loading...</p>
                    ) : (
                      <button
                        onClick={goNext}
                        className="font-heading text-xs tracking-[0.2em] uppercase text-stone-500 hover:text-stone-800 transition-colors border border-stone-300 hover:border-stone-500 px-6 py-2 rounded-sm"
                      >
                        Turn Page →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : currentPhoto ? (
              /* PHOTO SPREAD */
              <motion.div
                key={`photo-${currentIndex}`}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className="w-full h-full relative cursor-pointer"
                onClick={handlePhotoTap}
              >
                <div className="absolute inset-0 bg-black">
                  <ProgressiveImage
                    src={currentPhoto.variants?.lg || ''}
                    alt={currentPhoto.altText || currentPhoto.title || ''}
                    className="w-full h-full"
                    fit="contain"
                    eager
                  />
                </div>

                {/* Title bar at bottom — fades with controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 pb-14 md:p-6 md:pb-16 pointer-events-none transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  <h3 className="font-heading text-base md:text-lg text-white/90 tracking-wider">{currentPhoto.title}</h3>
                  <p className="font-body text-xs text-white/50 mt-1">{currentPhoto.location}</p>
                </div>

                {/* Info overlay */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-8 z-20"
                      onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
                    >
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-2xl w-full max-h-[80%] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-center mb-6">
                          <h3 className="font-heading text-2xl text-white tracking-wider mb-2">{currentPhoto.title}</h3>
                          <div className="w-16 h-px bg-white/20 mx-auto" />
                        </div>

                        {currentPhoto.caption && currentPhoto.caption.trim() !== '' && (
                          <p className="font-body text-sm text-white/80 leading-relaxed italic text-center mb-4">
                            "{currentPhoto.caption}"
                          </p>
                        )}

                        {currentPhoto.story && (
                          <p className="font-body text-sm text-white/60 leading-relaxed text-center mb-6">{currentPhoto.story}</p>
                        )}

                        {currentPhoto.curatorNote && (
                          <div className="border-l-2 border-white/20 pl-4 mb-6 mx-auto max-w-md">
                            <p className="font-body text-xs text-white/40 leading-relaxed italic">
                              Curator's note: {currentPhoto.curatorNote}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto mt-8 pt-6 border-t border-white/10">
                          {currentPhoto.metadata && Object.entries(currentPhoto.metadata).map(([key, value]) => (
                            <InfoBlock key={key} label={camelToTitle(key)} value={String(value)} />
                          ))}
                          {currentPhoto.location && <InfoBlock label="Location" value={currentPhoto.location} />}
                          {currentPhoto.dateTaken && <InfoBlock label="Date" value={currentPhoto.dateTaken.split('T')[0]} />}
                        </div>

                        <p className="text-center text-[10px] text-white/20 mt-6">Click anywhere to close</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
      </motion.div>

      {/* Controls wrapper — fades in/out on photo pages */}
      <div className={`transition-opacity duration-500 ${currentIndex >= 0 && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Nav arrows */}
      {(hasPrev || canGoPrevCollection) && (
        <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all group" aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {!hasPrev && prevCollection && (
            <span className="absolute right-full mr-2 whitespace-nowrap text-[10px] text-white/50 font-heading tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              {prevCollection.title}
            </span>
          )}
        </button>
      )}
      {(hasNext || canGoNextCollection) && (
        <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all group" aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {!hasNext && nextCollection && (
            <span className="absolute left-full ml-2 whitespace-nowrap text-[10px] text-white/50 font-heading tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              {nextCollection.title}
            </span>
          )}
        </button>
      )}

      {/* Close — z-30 to sit above everything */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowInfo(false); handleClose(); }}
        className="absolute top-3 right-3 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>

      {/* Bottom bar */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 flex items-center gap-2 md:gap-3 max-w-[90vw]" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <span className="text-[10px] text-white/50 font-heading tracking-[0.15em]">
          {currentIndex === -1 ? 'Title Page' : `${currentIndex + 1} / ${totalPages}`}
        </span>
        {currentIndex >= 0 && (
          <>
            <span className="text-[10px] text-white/20">·</span>
            <button
              onClick={() => goTo(-1)}
              className="text-[10px] text-white/40 hover:text-white/70 font-heading tracking-[0.1em] transition-colors"
            >
              ← Title
            </button>
            <span className="text-[10px] text-white/20">·</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowInfo(s => !s); }}
              className="text-[10px] text-white/40 hover:text-white/70 font-heading tracking-[0.1em] transition-colors"
            >
              ℹ Info
            </button>
          </>
        )}
        {(canGoPrevCollection || canGoNextCollection) && (
          <>
            <span className="text-[10px] text-white/20">·</span>
            <span className="text-[10px] text-white/30 font-body">
              {allCollections ? `${collectionIndex + 1} / ${allCollections.length} vol` : ''}
            </span>
          </>
        )}
      </div>
      </div>{/* end controls wrapper */}
    </motion.div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-0.5">{label}</dt>
      <dd className="text-xs text-white/70 font-body">{value}</dd>
    </div>
  );
}


function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/\bIso\b/g, 'ISO')
    .replace(/\bGps\b/g, 'GPS');
}
