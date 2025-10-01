/**
 * Extract images from existing crawl data and upload to Cloudinary
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const FOLDER_MAP = {
  'homepage': 'd2-sanitizers/homepage',
  'product': 'd2-sanitizers/products',
  'blog': 'd2-sanitizers/blog',
  'hand-sanitizers': 'd2-sanitizers/categories',
  'surface-sanitizers': 'd2-sanitizers/categories',
  'floor-sanitizers': 'd2-sanitizers/categories',
  'wipes': 'd2-sanitizers/categories',
  'dispensers': 'd2-sanitizers/categories',
  'peracetic-acid': 'd2-sanitizers/categories',
  'soap': 'd2-sanitizers/categories',
  'industry': 'd2-sanitizers/industries',
  'about': 'd2-sanitizers/about',
  'contact': 'd2-sanitizers/contact',
  'team': 'd2-sanitizers/team',
  'other': 'd2-sanitizers/general'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        fs.unlink(filepath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });

    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      fs.unlink(filepath, () => {});
      reject(new Error('Timeout'));
    });
  });
}

function categorizeUrl(url) {
  if (url.includes('/product/')) return 'product';
  if (url.includes('/blog/')) return 'blog';
  if (url.includes('/team/')) return 'team';
  if (url.includes('hand-sanitizer')) return 'hand-sanitizers';
  if (url.includes('surface-sanitizer')) return 'surface-sanitizers';
  if (url.includes('floor-sanitizer')) return 'floor-sanitizers';
  if (url.includes('wipes')) return 'wipes';
  if (url.includes('dispenser')) return 'dispensers';
  if (url.includes('peracetic')) return 'peracetic-acid';
  if (url.includes('soap')) return 'soap';
  if (url.includes('/about')) return 'about';
  if (url.includes('/contact')) return 'contact';
  if (url === 'https://www.d2sanitizers.com' || url === 'https://www.d2sanitizers.com/') return 'homepage';
  return 'other';
}

function generateFilename(imageUrl, index) {
  try {
    const url = new URL(imageUrl);
    const filename = path.basename(url.pathname);
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    return name
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 50) + `-${index}`;
  } catch (e) {
    return `image-${index}`;
  }
}

async function uploadToCloudinary(filepath, publicId, folder) {
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      public_id: publicId,
      folder: folder,
      resource_type: 'image',
      overwrite: false,
      tags: ['d2-sanitizers']
    });
    return result;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🚀 Extracting and Uploading Images to Cloudinary\n');

  const crawlPath = path.join(__dirname, '..', 'd2-apify-crawl.json');
  if (!fs.existsSync(crawlPath)) {
    console.error('❌ d2-apify-crawl.json not found');
    process.exit(1);
  }

  console.log('📖 Reading crawl data...');
  const crawlData = JSON.parse(fs.readFileSync(crawlPath, 'utf8'));
  console.log(`   Found ${crawlData.length} pages\n`);

  const tempDir = path.join(__dirname, '..', 'temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const imageMapping = [];
  const uniqueImages = new Map();
  let totalUploaded = 0;
  let totalSkipped = 0;

  // Extract unique images
  console.log('🔍 Extracting images from pages...\n');

  for (const page of crawlData) {
    const pageType = categorizeUrl(page.url);
    const images = page.images || [];

    for (const imgUrl of images) {
      if (!imgUrl || typeof imgUrl !== 'string') continue;

      // Skip already processed
      if (uniqueImages.has(imgUrl)) continue;

      // Skip external/CDN images not from d2sanitizers
      if (!imgUrl.includes('d2sanitizers.com') &&
          !imgUrl.includes('website-files.com')) {
        continue;
      }

      uniqueImages.set(imgUrl, { url: imgUrl, page: page.url, pageType });
    }
  }

  console.log(`   Found ${uniqueImages.size} unique images to upload\n`);
  console.log('📤 Starting upload...\n');

  let processed = 0;
  for (const [imgUrl, data] of uniqueImages) {
    processed++;
    const folder = FOLDER_MAP[data.pageType] || FOLDER_MAP['other'];

    try {
      const filename = generateFilename(imgUrl, processed);
      const tempPath = path.join(tempDir, `${filename}.tmp`);

      console.log(`[${processed}/${uniqueImages.size}] ${filename}`);

      await downloadImage(imgUrl, tempPath);
      const result = await uploadToCloudinary(tempPath, filename, folder);

      if (result) {
        console.log(`   ✅ ${result.public_id}`);
        totalUploaded++;

        imageMapping.push({
          originalUrl: imgUrl,
          cloudinaryPublicId: result.public_id,
          cloudinaryUrl: result.secure_url,
          page: data.page,
          pageType: data.pageType
        });
      } else {
        console.log(`   ⏭️  Skipped (already exists or error)`);
        totalSkipped++;
      }

      try { fs.unlinkSync(tempPath); } catch {}

    } catch (error) {
      console.log(`   ❌ ${error.message}`);
      totalSkipped++;
    }
  }

  // Save mapping
  const mappingPath = path.join(__dirname, '..', 'd2-image-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));

  // Cleanup
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ COMPLETE!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Total unique images: ${uniqueImages.size}`);
  console.log(`   Successfully uploaded: ${totalUploaded}`);
  console.log(`   Skipped/failed: ${totalSkipped}`);
  console.log(`\n📁 Mapping saved to: d2-image-mapping.json`);
  console.log('='.repeat(60));
}

main().catch(console.error);