import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  throw new Error('Missing Cloudinary cloud name');
}

// Create Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName
  }
});

// Types for image transformations
export interface CloudinaryImageOptions {
  publicId: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'pad' | 'lfill' | 'mfit';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  gravity?: string;
  aspectRatio?: number;
}

/**
 * Build a Cloudinary image URL with transformations
 * @param options - Image transformation options
 * @returns Fully qualified Cloudinary URL
 */
export function buildCloudinaryUrl(options: CloudinaryImageOptions): string {
  const {
    publicId,
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity,
    aspectRatio,
  } = options;

  const transformations: string[] = [];

  // Add crop mode
  if (crop) transformations.push(`c_${crop}`);

  // Add dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  // Add aspect ratio if specified
  if (aspectRatio && !height) transformations.push(`ar_${aspectRatio}`);

  // Add gravity for cropping
  if (gravity) transformations.push(`g_${gravity}`);

  // Add quality
  if (quality) transformations.push(`q_${quality}`);

  // Add format
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}

/**
 * Generate responsive srcset for multiple screen sizes
 * @param options - Responsive image options
 * @returns srcset string for img tag
 */
export function getCloudinaryResponsiveSet(options: {
  publicId: string;
  sizes: number[];
  crop?: string;
  quality?: number | 'auto';
  format?: string;
  aspectRatio?: number;
}): string {
  const { publicId, sizes, crop, quality, format, aspectRatio } = options;

  return sizes
    .map((size) => {
      const url = buildCloudinaryUrl({
        publicId,
        width: size,
        height: aspectRatio ? Math.round(size * aspectRatio) : undefined,
        crop: crop as any,
        quality,
        format: format as any,
      });
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * Helper function to get video URL
 * @param publicId - Cloudinary public ID for the video
 * @returns Cloudinary video URL
 */
export function getCloudinaryVideoUrl(publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`;
}

/**
 * Simple helper to get image URL (for backwards compatibility)
 * @param publicId - Cloudinary public ID
 * @returns Basic Cloudinary image URL
 */
export function getCloudinaryImageUrl(publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}