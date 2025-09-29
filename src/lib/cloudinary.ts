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

// Helper function to get video URL
export function getCloudinaryVideoUrl(publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`;
}

// Helper function to get image URL
export function getCloudinaryImageUrl(publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}