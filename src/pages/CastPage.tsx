import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import RuneDivider from '../components/arcane/RuneDivider';
import SpellCircle from '../components/arcane/SpellCircle';
import SpellbookSpine from '../components/archive/SpellbookSpine';
import OpenBook from '../components/archive/OpenBook';
import SigilIcon from '../components/arcane/SigilIcon';
import { loadCollections } from '../lib/archive';
import type { Collection } from '../types/archive';

export default function CastPage() {
  const [query, setQuery] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCasting, setIsCasting] = useState(false);
  const [openCollection, setOpenCollection] = useState<Collection | null>(null);

  useEffect(() => {
    loadCollections().then(setCollections).catch(console.error);
  }, []);

  const fuse = useMemo(() => new Fuse(collections, {
    keys: ['title', 'description', 'story', 'tags', 'location'],
    threshold: 0.4,
    includeScore: true,
  }), [collections]);

  const [results, setResults] = useState<Collection[]>([]);
  
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsCasting(false);
      return;
    }

    setIsCasting(true);
    const timeoutId = setTimeout(() => {
      const searchResults = fuse.search(query).map(r => r.item);
      setResults(searchResults);
      setIsCasting(false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, fuse]);

  const handleSelect = useCallback((collection: Collection) => {
    setOpenCollection(collection);
  }, []);

  const handleClose = useCallback(() => {
    setOpenCollection(null);
  }, []);

  return (
    <div className="w-full min-h-screen bg-arcane-void">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <SigilIcon name="search" size={28} className="text-arcane-cyan" />
            <h1 className="font-heading text-3xl md:text-4xl text-arcane-parchment tracking-[0.1em]">
              Cast a Spell
            </h1>
          </div>
          <RuneDivider variant="simple" glowColor="cyan" className="my-4 max-w-sm mx-auto" />
          <p className="font-body text-sm text-arcane-parchment-dim max-w-lg mx-auto">
            Focus your intent to summon specific volumes from the archive.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="relative max-w-xl mx-auto mb-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SigilIcon name="search" size={18} className="text-arcane-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Incantation (e.g. 'forest', 'urban', 'night')..."
            className="w-full bg-arcane-surface border border-arcane-border text-arcane-parchment pl-11 pr-12 py-3.5 rounded-lg focus:outline-none focus:border-arcane-cyan/50 focus:shadow-[0_0_20px_rgba(77,208,225,0.1)] transition-all font-body text-sm placeholder:text-arcane-muted"
            autoFocus
          />
          {isCasting && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <SpellCircle size={24} glowColor="cyan" animate={true} />
            </div>
          )}
        </motion.div>

        {/* No results */}
        {query && !isCasting && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <SigilIcon name="search" size={40} className="text-arcane-muted/30 mx-auto mb-4" />
            <p className="text-arcane-muted font-body text-sm italic">No conjurations align with this incantation.</p>
          </motion.div>
        )}

        {/* Results as books */}
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-xs text-arcane-muted font-heading tracking-[0.2em] uppercase mb-6">
              {results.length} {results.length === 1 ? 'volume' : 'volumes'} found
            </p>
            <div className="relative">
              <div className="absolute inset-x-0 top-0 bottom-3 rounded-t-sm" style={{ background: 'linear-gradient(180deg, rgba(30,22,16,0.8) 0%, rgba(20,15,10,0.9) 100%)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }} />
              <div className="relative flex items-end gap-3 px-6 pb-0 pt-4 min-h-[220px]">
                {results.map((collection, i) => (
                  <motion.div key={collection.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                    <SpellbookSpine collection={collection} onSelect={handleSelect} />
                  </motion.div>
                ))}
              </div>
              <div className="relative h-4 rounded-b-sm" style={{ background: 'linear-gradient(180deg, #5c3d2e 0%, #3d2b1f 40%, #2a1a12 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }} />
            </div>
          </motion.div>
        )}

        {/* Browse all when no query */}
        {!query && collections.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
            <p className="text-arcane-muted text-xs font-heading tracking-[0.2em] uppercase mb-8">All volumes</p>
            <div className="flex items-end justify-center gap-3">
              {collections.map(c => <SpellbookSpine key={c.slug} collection={c} onSelect={handleSelect} />)}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {openCollection && <OpenBook collection={openCollection} onClose={handleClose} />}
      </AnimatePresence>
    </div>
  );
}
