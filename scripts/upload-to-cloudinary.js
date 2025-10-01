/**
 * Upload D2 Sanitizers Images to Cloudinary
 *
 * Usage:
 * 1. First run the Apify crawler and download the JSON results
 * 2. Save the results as 'd2-images-crawl.json' in the project root
 * 3. Run: node scripts/upload-to-cloudinary.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'southland-organics',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Folder structure mapping
const FOLDER_MAP = {
  'homepage': 'd2-sanitizers/homepage',
  'product': 'd2-sanitizers/products',
  'blog': 'd2-sanitizers/blog',
  'category-hand-sanitizers': 'd2-sanitizers/categories',
  'category-surface-sanitizers': 'd2-sanitizers/categories',
  'category-floor-sanitizers': 'd2-sanitizers/categories',
  'category-wipes': 'd2-sanitizers/categories',
  'category-dispensers': 'd2-sanitizers/categories',
  'category-peracetic-acid': 'd2-sanitizers/categories',
  'category-soap': 'd2-sanitizers/categories',
  'industry': 'd2-sanitizers/industries',
  'about': 'd2-sanitizers/about',
  'contact': 'd2-sanitizers/contact',
  'other': 'd2-sanitizers/general'
};

// Image mapping output
const imageMapping = [];

// Download an image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(filepath);
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Generate a clean filename from URL and context
function generateFilename(imageUrl, context, pageType) {
  const url = new URL(imageUrl);
  const filename = path.basename(url.pathname);
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  // Clean the name
  let cleanName = name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  // Add context if available
  if (context && context !== 'general') {
    const cleanContext = context
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 30);
    cleanName = `${cleanContext}-${cleanName}`;
  }

  return cleanName;
}

// Upload image to Cloudinary
async function uploadToCloudinary(filepath, publicId, folder) {
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      public_id: publicId,
      folder: folder,
      resource_type: 'image',
      overwrite: false,
      tags: ['d2-sanitizers', 'migration']
    });

    return result;
  } catch (error) {
    console.error(`Error uploading ${publicId}:`, error.message);
    return null;
  }
}

// Main processing function
async function processImages() {
  console.log('🚀 Starting D2 Sanitizers Image Upload to Cloudinary\n');

  // Read the crawl data
  const crawlDataPath = path.join(__dirname, '..', 'd2-images-crawl.json');

  if (!fs.existsSync(crawlDataPath)) {
    console.error('❌ Error: d2-images-crawl.json not found!');
    console.error('Please run the Apify crawler first and save results as d2-images-crawl.json');
    process.exit(1);
  }

  const crawlData = JSON.parse(fs.readFileSync(crawlDataPath, 'utf8'));
  console.log(`📊 Found ${crawlData.length} pages to process\n`);

  // Create temp directory for downloads
  const tempDir = path.join(__dirname, '..', 'temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let totalProcessed = 0;
  let totalUploaded = 0;
  let totalSkipped = 0;

  // Process each page
  for (const page of crawlData) {
    console.log(`\n📄 Processing: ${page.title}`);
    console.log(`   URL: ${page.url}`);
    console.log(`   Type: ${page.pageType}`);
    console.log(`   Images: ${page.totalImages}`);

    const folder = FOLDER_MAP[page.pageType] || FOLDER_MAP['other'];

    // Process regular images
    for (const image of page.images) {
      totalProcessed++;

      // Skip external images (not from d2sanitizers.com or Webflow CDN)
      if (!image.url.includes('d2sanitizers.com') &&
          !image.url.includes('website-files.com') &&
          !image.url.includes('cloudinary.com')) {
        console.log(`   ⏭️  Skipping external: ${image.url}`);
        totalSkipped++;
        continue;
      }

      try {
        const filename = generateFilename(image.url, image.context, page.pageType);
        const tempPath = path.join(tempDir, `${filename}.tmp`);

        console.log(`   ⬇️  Downloading: ${filename}`);
        await downloadImage(image.url, tempPath);

        console.log(`   ⬆️  Uploading to Cloudinary...`);
        const result = await uploadToCloudinary(tempPath, filename, folder);

        if (result) {
          console.log(`   ✅ Uploaded: ${result.public_id}`);
          totalUploaded++;

          // Save mapping
          imageMapping.push({
            originalUrl: image.url,
            cloudinaryPublicId: result.public_id,
            cloudinaryUrl: result.secure_url,
            page: page.url,
            pageType: page.pageType,
            alt: image.alt,
            context: image.context
          });
        }

        // Clean up temp file
        fs.unlinkSync(tempPath);

      } catch (error) {
        console.error(`   ❌ Error processing ${image.url}:`, error.message);
      }
    }

    // Process background images
    for (const bgImage of page.backgroundImages || []) {
      totalProcessed++;

      if (!bgImage.url.includes('d2sanitizers.com') &&
          !bgImage.url.includes('website-files.com') &&
          !bgImage.url.includes('cloudinary.com')) {
        totalSkipped++;
        continue;
      }

      try {
        const filename = generateFilename(bgImage.url, 'background', page.pageType);
        const tempPath = path.join(tempDir, `${filename}.tmp`);

        await downloadImage(bgImage.url, tempPath);
        const result = await uploadToCloudinary(tempPath, filename, folder);

        if (result) {
          totalUploaded++;
          imageMapping.push({
            originalUrl: bgImage.url,
            cloudinaryPublicId: result.public_id,
            cloudinaryUrl: result.secure_url,
            page: page.url,
            pageType: page.pageType,
            type: 'background'
          });
        }

        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error(`   ❌ Error processing background image:`, error.message);
      }
    }
  }

  // Save the mapping file
  const mappingPath = path.join(__dirname, '..', 'd2-image-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));

  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ Upload Complete!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Total images processed: ${totalProcessed}`);
  console.log(`   Successfully uploaded: ${totalUploaded}`);
  console.log(`   Skipped (external): ${totalSkipped}`);
  console.log(`\n📁 Image mapping saved to: d2-image-mapping.json`);
  console.log('='.repeat(60));
}

// Run the script
processImages().catch(console.error);