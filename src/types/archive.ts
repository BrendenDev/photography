/**
 * Brenden's Archive — Data Layer Type Definitions
 * 
 * Foundational schema for collections, photos, metadata, and archive manifest.
 */

/**
 * Image orientation classification.
 */
export type Orientation = 'landscape' | 'portrait' | 'square';

/**
 * Image dimensions in pixels.
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Geographic GPS coordinates.
 */
export interface GPSLocation {
  lat: number;
  lng: number;
}

/**
 * Generated image variants with responsive width paths.
 */
export interface ImageVariants {
  thumb: string;
  lg: string;
}

/**
 * Date range span for a collection.
 */
export interface DateRange {
  from: string;
  to: string;
}

/**
 * A preserved photograph entry within the Archive.
 * 
 * User-facing fields are rigid. Camera/technical data lives in `metadata`
 * as a flexible key-value store to accommodate different cameras and formats.
 */
export interface Photo {
  slug: string;
  title: string;
  caption?: string;
  story?: string;
  curatorNote?: string;
  tags?: string[];
  dateTaken?: string;
  location?: string;
  orientation: Orientation;
  dimensions: Dimensions;
  altText?: string;
  variants: ImageVariants;
  /** Flexible camera/technical metadata — stores whatever EXIF the camera provides */
  metadata?: Record<string, unknown>;
}

/**
 * A curated volume containing a thematic set of photos.
 */
export interface Collection {
  title: string;
  slug: string;
  volumeNumber: number;
  description?: string;
  story?: string;
  tags?: string[];
  dateRange?: DateRange;
  location?: string;
  featured: boolean;
  visible: boolean;
  photoOrder: string[];
}

/**
 * Root index manifest for the entire Archive.
 */
export interface ArchiveManifest {
  version: string;
  lastGenerated: string;
  collectionCount: number;
  photoCount: number;
  checksum: string;
  searchIndexVersion: string;
}
