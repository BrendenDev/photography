import { useState, useEffect, useRef, memo } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  /** If true, load immediately (above the fold). Otherwise lazy-load. */
  eager?: boolean;
  /** Object-fit style */
  fit?: 'contain' | 'cover' | 'fill';
  onClick?: () => void;
}

/**
 * Image with shimmer skeleton → smooth fade-in on load.
 * Prevents pop-in by only revealing the image after it's fully decoded.
 */
const ProgressiveImage = memo(function ProgressiveImage({ 
  src, alt, className = '', eager = false, fit = 'contain', onClick 
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Check if image is already cached (instant display)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {/* Shimmer skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-arcane-surface animate-pulse">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className="w-full h-full transition-opacity duration-500 ease-out"
        style={{ 
          objectFit: fit,
          opacity: loaded ? 1 : 0,
        }}
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-arcane-surface">
          <span className="text-arcane-muted text-xs font-body">Failed to load</span>
        </div>
      )}
    </div>
  );
});

export default ProgressiveImage;
