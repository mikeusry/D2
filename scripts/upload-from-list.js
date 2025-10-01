/**
 * Upload images from D2_IMAGES_BY_PAGE.txt to Cloudinary
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
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
  'product': 'd2-sanitizers/products',
  'blog': 'd2-sanitizers/blog',
  'hand-sanitizers': 'd2-sanitizers/categories',
  'surface-sanitizers': 'd2-sanitizers/categories',
  'floor-sanitizers': 'd2-sanitizers/categories',
  'wipes': 'd2-sanitizers/categories',
  'dispensers': 'd2-sanitizers/categories',
  'peracetic-acid': 'd2-sanitizers/categories',
  'soap': 'd2-sanitizers/categories',
  'team': 'd2-sanitizers/team',
  'other': 'd2-sanitizers/general'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
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
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    }).setTimeout(15000, function() {
      this.destroy();
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
  return 'other';
}

function generateFilename(imageUrl) {
  try {
    const urlPath = new URL(imageUrl).pathname;
    const filename = path.basename(urlPath);
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    return name
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  } catch (e) {
    return 'image-' + Math.random().toString(36).substring(7);
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
    if (error.message && error.message.includes('already exists')) {
      return { alreadyExists: true, public_id: `${folder}/${publicId}` };
    }
    return null;
  }
}

async function main() {
  console.log('🚀 Uploading D2 Sanitizers Images to Cloudinary\n');

  const imagesListPath = path.join(__dirname, '..', 'D2_IMAGES_BY_PAGE.txt');
  if (!fs.existsSync(imagesListPath)) {
    console.error('❌ D2_IMAGES_BY_PAGE.txt not found');
    process.exit(1);
  }

  console.log('📖 Reading image list...');
  const content = fs.readFileSync(imagesListPath, 'utf8');

  // Parse the file
  const images = [];
  const lines = content.split('\n');
  let currentPage = '';
  let currentUrl = '';

  for (const line of lines) {
    if (line.startsWith('Page: ')) {
      currentPage = line.replace('Page: ', '').trim();
    } else if (line.startsWith('URL: ')) {
      currentUrl = line.replace('URL: ', '').trim();
    } else if (line.trim().match(/^\d+\.\s+https/)) {
      const imageUrl = line.trim().replace(/^\d+\.\s+/, '');
      images.push({
        url: imageUrl,
        page: currentPage,
        pageUrl: currentUrl,
        pageType: categorizeUrl(currentUrl)
      });
    }
  }

  console.log(`   Found ${images.length} images\n`);

  const tempDir = path.join(__dirname, '..', 'temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const imageMapping = [];
  let totalUploaded = 0;
  let totalExists = 0;
  let totalFailed = 0;

  console.log('📤 Starting upload...\n');

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const folder = FOLDER_MAP[image.pageType] || FOLDER_MAP['other'];

    try {
      const filename = generateFilename(image.url);
      const tempPath = path.join(tempDir, `${filename}.tmp`);

      console.log(`[${i + 1}/${images.length}] ${filename}`);
      console.log(`   Page: ${image.page}`);

      await downloadImage(image.url, tempPath);
      const result = await uploadToCloudinary(tempPath, filename, folder);

      if (result) {
        if (result.alreadyExists) {
          console.log(`   ⏭️  Already exists: ${result.public_id}`);
          totalExists++;
        } else {
          console.log(`   ✅ Uploaded: ${result.public_id}`);
          totalUploaded++;
        }

        imageMapping.push({
          originalUrl: image.url,
          cloudinaryPublicId: result.public_id,
          cloudinaryUrl: result.secure_url || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${result.public_id}`,
          page: image.page,
          pageUrl: image.pageUrl,
          pageType: image.pageType
        });
      } else {
        console.log(`   ❌ Upload failed`);
        totalFailed++;
      }

      try { fs.unlinkSync(tempPath); } catch {}

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      totalFailed++;
    }

    console.log('');
  }

  // Save mapping
  const mappingPath = path.join(__dirname, '..', 'd2-image-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));

  // Cleanup
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

  // Summary
  console.log('='.repeat(60));
  console.log('✨ UPLOAD COMPLETE!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Total images processed: ${images.length}`);
  console.log(`   Successfully uploaded: ${totalUploaded}`);
  console.log(`   Already existed: ${totalExists}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log(`\n📁 Mapping saved to: d2-image-mapping.json`);
  console.log('='.repeat(60));
}

main().catch(console.error);