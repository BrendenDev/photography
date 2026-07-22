import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { loadCollection, loadPhotos, resolveContentUrl } from '../lib/archive';
import type { Collection, Photo } from '../types/archive';
import PhotoGrid from '../components/archive/PhotoGrid';
import RuneDivider from '../components/arcane/RuneDivider';
import SpellCircle from '../components/arcane/SpellCircle';
import SigilIcon from '../components/arcane/SigilIcon';

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const colData = await loadCollection(slug);
        if (colData) {
          setCollection(colData);
          const photoData = await loadPhotos(slug);
          setPhotos(photoData);
        }
      } catch (err) {
        console.error("Failed to load collection", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollectionData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-arcane-void">
        <SpellCircle size={60} glowColor="amber" animate={true} />
        <p className="mt-6 font-heading text-sm text-arcane-amber animate-pulse tracking-[0.2em]">
          Unsealing volume...
        </p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-arcane-void">
        <SigilIcon name="collection" size={48} className="text-arcane-muted mb-4" />
        <p className="font-heading text-arcane-parchment-dim tracking-wider">Volume not found in the archives.</p>
        <Link to="/library" className="mt-6 text-sm text-arcane-cyan hover:text-arcane-cyan-glow font-heading tracking-wider">
          ← Return to the Library
        </Link>
      </div>
    );
  }

  const coverUrl = collection.coverImage 
    ? resolveContentUrl(typeof collection.coverImage === 'string' ? collection.coverImage : collection.coverImage.lg)
    : '';

  return (
    <div className="w-full bg-arcane-void">
      {/* Cover header */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        {coverUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverUrl})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-arcane-deep to-arcane-void" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-arcane-void via-arcane-void/70 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/library" className="flex items-center gap-2 text-sm text-arcane-parchment-dim hover:text-arcane-parchment font-heading tracking-wider transition-colors bg-arcane-void/50 backdrop-blur-sm px-3 py-2 rounded">
            ← Library
          </Link>
        </div>

        {/* Collection info overlay */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <span className="px-3 py-1 text-xs font-heading tracking-[0.25em] text-arcane-amber bg-arcane-void/80 rounded border border-arcane-amber/30 backdrop-blur-sm uppercase">
                Volume {collection.volumeNumber || 'I'}
              </span>
              {collection.dateRange && (
                <span className="text-xs text-arcane-parchment-dim font-body">
                  {collection.dateRange.from.split('T')[0]}
                </span>
              )}
              <span className="text-xs text-arcane-parchment-dim font-body italic">
                {collection.location}
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-arcane-parchment tracking-[0.06em]"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {collection.title}
            </h1>
          </div>
        </motion.div>
      </div>

      {/* Content body */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Description & Tags */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <p className="text-arcane-parchment-dim font-body text-lg leading-relaxed max-w-3xl mb-6">
            {collection.description}
          </p>
          
          {collection.story && (
            <p className="text-arcane-muted font-body text-sm leading-relaxed max-w-3xl italic border-l-2 border-arcane-amber/30 pl-4 mb-6">
              {collection.story}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {collection.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 text-xs bg-arcane-deep rounded border border-arcane-border text-arcane-cyan font-heading tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <RuneDivider variant="ornate" glowColor="cyan" className="mb-12" />

        {/* Photo grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-xl text-arcane-brass tracking-wider">
              {photos.length} {photos.length === 1 ? 'Memory' : 'Memories'} Bound
            </h2>
          </div>

          {photos.length > 0 ? (
            <PhotoGrid photos={photos} collectionSlug={collection.slug} />
          ) : (
            <div className="text-center py-20 text-arcane-muted font-body italic border border-dashed border-arcane-border rounded-lg">
              No memories currently bound to this volume.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
