import exifr from 'exifr';

export interface ImageVariantResult {
  thumb: Blob;
  lg: Blob;
  dimensions: { width: number; height: number };
  orientation: 'landscape' | 'portrait' | 'square';
}

async function resizeImage(bitmap: ImageBitmap, maxDim: number, quality: number): Promise<Blob> {
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.convertToBlob({ type: 'image/webp', quality });
}

export async function generateVariants(file: File): Promise<ImageVariantResult> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;

  let orientation: 'landscape' | 'portrait' | 'square' = 'square';
  if (width > height) orientation = 'landscape';
  else if (height > width) orientation = 'portrait';

  const thumb = await resizeImage(bitmap, 400, 0.75);
  const lg = await resizeImage(bitmap, 2400, 0.90);

  return { thumb, lg, dimensions: { width, height }, orientation };
}

/**
 * Extract ALL available EXIF metadata from a photo file.
 * Returns a flat key-value object — different cameras produce different fields,
 * and we capture whatever is available.
 */
export async function extractMetadata(file: File): Promise<Record<string, unknown>> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
    });

    if (!data) return {};

    const metadata: Record<string, unknown> = {};

    // Camera info
    if (data.Make) metadata.cameraMake = data.Make;
    if (data.Model) metadata.cameraModel = data.Model;
    if (data.Make || data.Model) {
      metadata.camera = [data.Make, data.Model].filter(Boolean).join(' ');
    }
    if (data.LensModel) metadata.lens = data.LensModel;

    // Exposure info
    if (data.ISO) metadata.iso = data.ISO;
    if (data.ExposureTime) {
      metadata.shutterSpeed = data.ExposureTime >= 1
        ? `${data.ExposureTime}s`
        : `1/${Math.round(1 / data.ExposureTime)}`;
    }
    if (data.FNumber) metadata.aperture = `f/${data.FNumber}`;
    if (data.FocalLength) metadata.focalLength = `${data.FocalLength}mm`;
    if (data.ExposureCompensation !== undefined) metadata.exposureCompensation = `${data.ExposureCompensation} EV`;
    if (data.MeteringMode) metadata.meteringMode = data.MeteringMode;
    if (data.WhiteBalance) metadata.whiteBalance = data.WhiteBalance;
    if (data.Flash) metadata.flash = data.Flash;

    // Date
    if (data.DateTimeOriginal) {
      metadata.dateTaken = data.DateTimeOriginal instanceof Date
        ? data.DateTimeOriginal.toISOString()
        : String(data.DateTimeOriginal);
    }

    // GPS
    if (data.latitude && data.longitude) {
      metadata.gpsLat = data.latitude;
      metadata.gpsLng = data.longitude;
      metadata.gps = `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
    }

    // Software
    if (data.Software) metadata.software = data.Software;

    return metadata;
  } catch (e) {
    console.warn('EXIF extraction failed:', e);
    return {};
  }
}
