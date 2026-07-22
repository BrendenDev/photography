import exifr from 'exifr';

export interface ImageVariantResult {
  thumb: Blob;
  lg: Blob;
  dimensions: { width: number; height: number };
  orientation: 'landscape' | 'portrait' | 'square';
}

export interface ExifData {
  camera?: { body?: string; lens?: string };
  exposure?: { iso?: number; shutterSpeed?: string; aperture?: string; focalLength?: string };
  dateTaken?: string;
  location?: string;
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

  return {
    thumb,
    lg,
    dimensions: { width, height },
    orientation
  };
}

function formatShutterSpeed(time: number): string {
  if (time >= 1) return `${time}s`;
  return `1/${Math.round(1 / time)}`;
}

export async function extractExif(file: File): Promise<ExifData> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true
    });
    
    if (!data) return {};

    const exifData: ExifData = {};
    
    if (data.Make || data.Model) {
      exifData.camera = {
        body: [data.Make, data.Model].filter(Boolean).join(' ')
      };
      if (data.LensModel) {
        exifData.camera.lens = data.LensModel;
      }
    }

    if (data.ISO || data.ExposureTime || data.FNumber || data.FocalLength) {
      exifData.exposure = {};
      if (data.ISO) exifData.exposure.iso = data.ISO;
      if (data.ExposureTime) exifData.exposure.shutterSpeed = formatShutterSpeed(data.ExposureTime);
      if (data.FNumber) exifData.exposure.aperture = `f/${data.FNumber}`;
      if (data.FocalLength) exifData.exposure.focalLength = `${data.FocalLength}mm`;
    }

    if (data.DateTimeOriginal) {
      exifData.dateTaken = new Date(data.DateTimeOriginal).toISOString();
    }

    if (data.latitude && data.longitude) {
      exifData.location = `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
    }

    return exifData;
  } catch (e) {
    console.error('Failed to parse EXIF:', e);
    return {};
  }
}
