/**
 * D2 Sanitizers - Complete Crawl and Upload Script
 * Crawls the website and uploads images to Cloudinary in one go
 */

import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'southland-organics',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const START_URL = 'https://www.d2sanitizers.com';
const MAX_PAGES = 50;
const visited = new Set();
const crawlData = [];

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

function categorizePageType(url, title) {
  if (url.includes('/product/')) return 'product';
  if (url.includes('/blog/')) return 'blog';
  if (url.includes('/industries/')) return 'industry';
  if (url.includes('hand-sanitizer')) return 'category-hand-sanitizers';
  if (url.includes('surface-sanitizer')) return 'category-surface-sanitizers';
  if (url.includes('floor-sanitizer')) return 'category-floor-sanitizers';
  if (url.includes('wipes') || url.includes('disinfectant-wipes')) return 'category-wipes';
  if (url.includes('dispenser')) return 'category-dispensers';
  if (url.includes('peracetic')) return 'category-peracetic-acid';
  if (url.includes('soap') || url.includes('industrial-hand-soap')) return 'category-soap';
  if (url.includes('/about')) return 'about';
  if (url.includes('/contact')) return 'contact';
  if (url === START_URL || url === START_URL + '/') return 'homepage';
  return 'other';
}

async function crawlPage(browser, url) {
  if (visited.has(url) || visited.size >= MAX_PAGES) {
    return;
  }

  visited.add(url);
  console.log(`\n📄 Crawling [${visited.size}/${MAX_PAGES}]: ${url}`);

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const data = await page.evaluate(() => {
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.src) {
          images.push({
            url: img.src,
            alt: img.alt || '',
            className: img.className || ''
          });
        }
      });

      const documents = [];
      document.querySelectorAll('a[href$=".pdf"], a[href*="download"]').forEach(link => {
        documents.push({
          url: link.href,
          text: link.textContent.trim()
        });
      });

      const links = [];
      document.querySelectorAll('a[href]').forEach(link => {
        const href = link.href;
        if (href.startsWith(window.location.origin)) {
          links.push(href);
        }
      });

      return {
        title: document.title,
        images: images,
        documents: documents,
        links: links
      };
    });

    const pageData = {
      url: url,
      title: data.title,
      pageType: categorizePageType(url, data.title),
      images: data.images,
      documents: data.documents,
      totalImages: data.images.length,
      totalDocuments: data.documents.length
    };

    crawlData.push(pageData);
    console.log(`   ✅ Found ${data.images.length} images, ${data.documents.length} documents`);

    await page.close();

    // Crawl linked pages
    for (const link of data.links) {
      if (!visited.has(link) && visited.size < MAX_PAGES) {
        await crawlPage(browser, link);
      }
    }

  } catch (error) {
    console.error(`   ❌ Error crawling ${url}:`, error.message);
  }
}

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

function generateFilename(imageUrl, pageType, index) {
  const url = new URL(imageUrl);
  let filename = path.basename(url.pathname);
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 50);
}

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

async function main() {
  console.log('🚀 D2 Sanitizers - Crawl and Upload to Cloudinary\n');
  console.log('='.repeat(60));

  // Check Cloudinary credentials
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('\n❌ ERROR: Cloudinary credentials missing!');
    console.error('Please add to your .env file:');
    console.error('  CLOUDINARY_CLOUD_NAME=southland-organics');
    console.error('  CLOUDINARY_API_KEY=your_key');
    console.error('  CLOUDINARY_API_SECRET=your_secret\n');
    process.exit(1);
  }

  // Step 1: Crawl the website
  console.log('\n📡 STEP 1: Crawling website...\n');
  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    await crawlPage(browser, START_URL);
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Crawl complete! Found ${crawlData.length} pages`);

  // Save crawl data
  const crawlDataPath = path.join(__dirname, '..', 'd2-images-crawl.json');
  fs.writeFileSync(crawlDataPath, JSON.stringify(crawlData, null, 2));
  console.log(`📁 Crawl data saved to: d2-images-crawl.json`);

  // Step 2: Upload images
  console.log('\n📤 STEP 2: Uploading images to Cloudinary...\n');

  const tempDir = path.join(__dirname, '..', 'temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const imageMapping = [];
  let totalUploaded = 0;
  let totalSkipped = 0;

  for (const page of crawlData) {
    console.log(`\n📄 Processing: ${page.title}`);
    const folder = FOLDER_MAP[page.pageType] || FOLDER_MAP['other'];

    for (let i = 0; i < page.images.length; i++) {
      const image = page.images[i];

      // Skip external images
      if (!image.url.includes('d2sanitizers.com') &&
          !image.url.includes('website-files.com') &&
          !image.url.includes('cloudinary.com')) {
        totalSkipped++;
        continue;
      }

      try {
        const filename = generateFilename(image.url, page.pageType, i);
        const tempPath = path.join(tempDir, `${filename}.tmp`);

        console.log(`   ⬇️  Downloading: ${filename}`);
        await downloadImage(image.url, tempPath);

        console.log(`   ⬆️  Uploading to Cloudinary...`);
        const result = await uploadToCloudinary(tempPath, filename, folder);

        if (result) {
          console.log(`   ✅ Uploaded: ${result.public_id}`);
          totalUploaded++;

          imageMapping.push({
            originalUrl: image.url,
            cloudinaryPublicId: result.public_id,
            cloudinaryUrl: result.secure_url,
            page: page.url,
            pageType: page.pageType,
            alt: image.alt
          });
        }

        fs.unlinkSync(tempPath);

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }

  // Save mapping
  const mappingPath = path.join(__dirname, '..', 'd2-image-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));

  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ COMPLETE!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Pages crawled: ${crawlData.length}`);
  console.log(`   Images uploaded: ${totalUploaded}`);
  console.log(`   Images skipped: ${totalSkipped}`);
  console.log(`\n📁 Files created:`);
  console.log(`   d2-images-crawl.json - Full crawl data`);
  console.log(`   d2-image-mapping.json - Image URL mappings`);
  console.log('='.repeat(60));
}

main().catch(console.error);