import type { Collection } from '../../types/archive';
import SpellbookSpine from './SpellbookSpine';

interface BookshelfProps {
  collections: Collection[];
  onSelectCollection?: (collection: Collection) => void;
  label?: string;
  className?: string;
}

/**
 * A literal wooden bookshelf that holds SpellbookSpine volumes.
 * Features a wood-grain shelf with shadow depth and subtle candlelight ambiance.
 */
export default function Bookshelf({ collections, onSelectCollection, label, className = '' }: BookshelfProps) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <div className="mb-4 px-2">
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-arcane-brass/70">{label}</span>
        </div>
      )}

      <div className="relative">
        {/* Back wall texture */}
        <div 
          className="absolute inset-x-0 top-0 bottom-3 rounded-t-sm"
          style={{
            background: 'linear-gradient(180deg, rgba(30,22,16,0.8) 0%, rgba(20,15,10,0.9) 100%)',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
          }}
        />
        
        {/* Books row */}
        <div className="relative flex items-end gap-3 px-6 pb-0 pt-4 min-h-[220px] overflow-x-auto">
          {/* Ambient candle glow */}
          <div 
            className="absolute top-2 left-4 w-16 h-16 rounded-full animate-flicker pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,181,77,0.15) 0%, transparent 70%)' }}
          />

          {collections.map((collection) => (
            <SpellbookSpine 
              key={collection.slug} 
              collection={collection}
              onSelect={onSelectCollection}
            />
          ))}

          {collections.length < 4 && (
            <div className="flex-1 min-w-[60px]" />
          )}
        </div>

        {/* Shelf plank */}
        <div 
          className="relative h-4 rounded-b-sm"
          style={{
            background: 'linear-gradient(180deg, #5c3d2e 0%, #3d2b1f 40%, #2a1a12 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 22px)',
            }}
          />
        </div>

        <div className="absolute -bottom-2 left-6 w-3 h-2 bg-black/30 rounded-b-sm" />
        <div className="absolute -bottom-2 right-6 w-3 h-2 bg-black/30 rounded-b-sm" />
      </div>
    </div>
  );
}
