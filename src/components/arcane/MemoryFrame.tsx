import React, { useState } from 'react';
import { motion } from 'motion/react';

interface MemoryFrameProps {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  onClick?: () => void;
  className?: string;
}

const MemoryFrame: React.FC<MemoryFrameProps> = ({
  src,
  alt,
  title,
  caption,
  aspectRatio = 'landscape',
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  let ratioClass = 'aspect-[3/2]';
  if (aspectRatio === 'portrait') ratioClass = 'aspect-[2/3]';
  else if (aspectRatio === 'square') ratioClass = 'aspect-square';

  return (
    <motion.div
      className={`relative group cursor-pointer overflow-hidden rounded-sm bg-arcane-deep border border-arcane-border ${ratioClass} ${className}`}
      whileHover={{ scale: 1.01, boxShadow: '0 10px 30px -10px rgba(77,208,225,0.2)' }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      role="img"
      aria-label={alt}
    >
      {/* Corner Runes */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-arcane-cyan opacity-40 z-20 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-arcane-cyan opacity-40 z-20 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-arcane-cyan opacity-40 z-20 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-arcane-cyan opacity-40 z-20 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Image / Placeholder */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-gradient-to-br from-arcane-surface to-arcane-void">
        <motion.div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        {/* Placeholder gradient overlay to make it look atmospheric */}
        <div className="absolute inset-0 bg-gradient-to-t from-arcane-void via-transparent to-transparent opacity-80" />
      </div>

      {/* Caption Overlay */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.3 }}
      >
        {title && <h4 className="font-heading text-arcane-parchment text-lg">{title}</h4>}
        {caption && <p className="font-body text-arcane-parchment-dim text-sm mt-1">{caption}</p>}
      </motion.div>
    </motion.div>
  );
};

export default MemoryFrame;
