import { motion } from 'motion/react';
import type { Photo } from '../../types/archive';
import MemoryFrame from '../arcane/MemoryFrame';

interface PhotoGridProps {
  photos: Photo[];
  collectionSlug: string;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export default function PhotoGrid({ photos, collectionSlug: _collectionSlug, className = '' }: PhotoGridProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {photos.map((photo) => (
        <motion.div key={photo.slug} variants={itemVariants}>
          <MemoryFrame
            src={photo.variants?.lg || ''}
            alt={photo.altText || photo.title}
            title={photo.title}
            caption={photo.location}
            aspectRatio={photo.orientation || 'landscape'}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
