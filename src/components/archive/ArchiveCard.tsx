import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { Collection } from '../../types/archive';
import SigilIcon from '../arcane/SigilIcon';
import RuneDivider from '../arcane/RuneDivider';

interface ArchiveCardProps {
  collection: Collection;
  className?: string;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ collection, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className={`group block relative rounded-lg overflow-hidden border border-arcane-border bg-arcane-surface/50 backdrop-blur-sm transition-all duration-300 hover:border-arcane-amber/50 hover:shadow-[0_8px_30px_rgba(232,181,77,0.15)] ${className}`}
    >
      <Link to={`/collection/${collection.slug}`} className="absolute inset-0 z-20" />
      
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-arcane-deep to-arcane-void">
        {/* Placeholder for Cover */}
        {collection.coverImage ? (
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${typeof collection.coverImage === 'string' ? collection.coverImage : collection.coverImage.md})` }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-300">
             <SigilIcon name="collection" size={64} className="text-arcane-amber" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-arcane-void to-transparent opacity-90" />
        
        <div className="absolute top-4 left-4 z-10">
          <span className="px-2 py-1 text-xs font-heading tracking-widest text-arcane-amber bg-arcane-void/80 border border-arcane-amber/30 rounded backdrop-blur-md">
            VOL. {collection.volumeNumber || 'I'}
          </span>
        </div>
      </div>

      <div className="p-6 relative z-10">
        <h3 className="font-heading text-2xl text-arcane-parchment mb-2 group-hover:text-arcane-amber-glow transition-colors">
          {collection.title}
        </h3>
        
        <p className="font-body text-sm text-arcane-parchment-dim line-clamp-2 mb-4">
          {collection.description}
        </p>

        <RuneDivider variant="simple" glowColor="amber" className="my-4 opacity-50" />
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {collection.tags?.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs text-arcane-muted bg-arcane-deep px-2 py-1 rounded-sm border border-arcane-border">
                {tag}
              </span>
            ))}
          </div>
          <div className="text-arcane-cyan flex items-center">
             <SigilIcon name="star" size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchiveCard;
