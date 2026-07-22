import type { ArchiveManifest, Collection, Photo } from '../types/archive';

const BASE_URL = import.meta.env.BASE_URL;

/**
 * Resolve a content-relative path to a full URL.
 * Converts "content/collections/foo/images/bar.webp" to "/photography/content/collections/foo/images/bar.webp"
 */
export function resolveContentUrl(path: string): string {
  if (!path) return '';
  // If already an absolute URL, return as-is
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `${BASE_URL}${path}`;
}

export async function loadManifest(): Promise<ArchiveManifest> {
  const res = await fetch(`${BASE_URL}content/manifest.json`);
  if (!res.ok) throw new Error('Failed to load manifest');
  return res.json();
}

// Load collection slugs dynamically from index.json
async function getCollectionSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}content/collections/index.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.collections || [];
  } catch {
    return [];
  }
}

export async function loadCollections(): Promise<Collection[]> {
  const slugs = await getCollectionSlugs();
  const results = await Promise.allSettled(
    slugs.map(slug => loadCollection(slug))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Collection> => r.status === 'fulfilled')
    .map(r => r.value);
}

export async function loadCollection(slug: string): Promise<Collection> {
  const res = await fetch(`${BASE_URL}content/collections/${slug}/collection.json`);
  if (!res.ok) throw new Error(`Failed to load collection: ${slug}`);
  return res.json();
}

export async function loadPhotos(collectionSlug: string): Promise<Photo[]> {
  const collection = await loadCollection(collectionSlug);
  const results = await Promise.allSettled(
    collection.photoOrder.map((photoSlug: string) => loadPhoto(collectionSlug, photoSlug))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Photo> => r.status === 'fulfilled')
    .map(r => r.value);
}

export async function loadPhoto(collectionSlug: string, photoSlug: string): Promise<Photo> {
  const res = await fetch(`${BASE_URL}content/collections/${collectionSlug}/photos/${photoSlug}.json`);
  if (!res.ok) throw new Error(`Failed to load photo: ${collectionSlug}/${photoSlug}`);
  const photo: Photo = await res.json();
  
  // Resolve all variant paths to full URLs
  if (photo.variants) {
    photo.variants = {
      thumb: resolveContentUrl(photo.variants.thumb),
      lg: resolveContentUrl(photo.variants.lg),
    };
  }
  
  return photo;
}
