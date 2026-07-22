/**
 * Brenden's Archive — Data Layer Type Definitions
 * 
 * Foundational schema for collections, photos, metadata, and archive manifest.
 */

/**
 * Mood affinities available across the archive.
 * Represents the emotional throughline or aesthetic atmosphere of collections and photos.
 */
export type Mood =
  | 'ethereal'
  | 'bold'
  | 'serene'
  | 'dramatic'
  | 'intimate'
  | 'mysterious'
  | 'vibrant'
  | 'melancholic'
  | 'whimsical'
  | 'raw';

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
 * Camera hardware information.
 */
export interface CameraMetadata {
  body: string;
  lens: string;
}

/**
 * Photographic exposure parameters.
 */
export interface ExposureMetadata {
  iso: number;
  shutterSpeed: string;
  aperture: string;
  focalLength: string;
}

/**
 * Geographic GPS coordinates.
 */
export interface GPSLocation {
  lat: number;
  lng: number;
}

/**
 * Raw technical metadata extracted from photo EXIF data.
 */
export interface TechnicalMetadata {
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
  focalLength: string;
  timestamp: string; // ISO date string
  gps: GPSLocation | null;
  dimensions: Dimensions;
}

/**
 * Generated image variants with responsive width paths.
 */
export interface ImageVariants {
  thumb: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/**
 * Date range span for a collection.
 */
export interface DateRange {
  from: string; // ISO date string e.g. "2024-05-01T00:00:00Z"
  to: string;   // ISO date string e.g. "2024-10-15T00:00:00Z"
}

/**
 * A preserved photograph entry within the Archive.
 */
export interface Photo {
  filename: string;
  slug: string;
  title: string;
  caption: string;
  story: string;
  curatorNote: string;
  tags: string[];
  mood: Mood;
  dateTaken: string; // ISO date string
  location: string;
  camera: CameraMetadata;
  exposure: ExposureMetadata;
  orientation: Orientation;
  dimensions: Dimensions;
  altText: string;
  variants: ImageVariants;
}

/**
 * A curated volume / grimoire containing a thematic set of photos.
 */
export interface Collection {
  title: string;
  slug: string;
  volumeNumber: number;
  coverImage: string | ImageVariants;
  description: string;
  story: string;
  tags: string[];
  mood: Mood;
  dateRange: DateRange;
  location: string;
  featured: boolean;
  visible: boolean;
  photoOrder: string[];
}

/**
 * Root index manifest for the entire Archive.
 */
export interface ArchiveManifest {
  version: string;
  lastGenerated: string; // ISO date string
  collectionCount: number;
  photoCount: number;
  checksum: string;
  searchIndexVersion: string;
}
