import { PuppeteerCrawler, Dataset } from 'crawlee';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import slug from 'slug';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create directories
const IMAGES_DIR = path.join(__dirname, 'crawled-data', 'images');
const DOCUMENTS_DIR = path.join(__dirname, 'crawled-data', 'documents');
const METADATA_DIR = path.join(__dirname, 'crawled-data', 'metadata');

await fs.ensureDir(IMAGES_DIR);
await fs.ensureDir(DOCUMENTS_DIR);
await fs.ensureDir(METADATA_DIR);

// Download function
async function downloadFile(url, localPath, metadata = {}) {
    try {
        console.log(`Downloading: ${url}`);
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            httpsAgent: new (await import('https')).Agent({
                rejectUnauthorized: false
            })
        });

        await fs.ensureDir(path.dirname(localPath));
        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✓ Downloaded: ${path.basename(localPath)}`);
                resolve({ localPath, metadata, originalUrl: url });
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`✗ Failed to download ${url}:`, error.message);
        return null;
    }
}

// Cloudinary upload
async function uploadToCloudinary(localPath, metadata) {
    try {
        const filename = path.basename(localPath, path.extname(localPath));
        const folder = metadata.category ? `d2-sanitizers/BEST/${metadata.category}` : 'd2-sanitizers/BEST/misc';

        const result = await cloudinary.uploader.upload(localPath, {
            folder: folder,
            public_id: `${slug(metadata.productName || filename)}-${Date.now()}`,
            tags: [
                'BEST',
                'bestsanitizers',
                'competitor-analysis',
                metadata.category,
                metadata.productType,
                ...(metadata.keywords || [])
            ].filter(Boolean),
            context: {
                source: 'bestsanitizers.com',
                competitor: 'BEST',
                product_name: metadata.productName || '',
                category: metadata.category || '',
                page_url: metadata.pageUrl || '',
                alt_text: metadata.altText || '',
                crawled_date: new Date().toISOString(),
                purpose: 'competitor-research'
            }
        });

        console.log(`☁️ Uploaded to Cloudinary: ${result.public_id}`);
        return result;
    } catch (error) {
        console.error(`✗ Cloudinary upload failed for ${localPath}:`, error.message);
        return null;
    }
}

// Extract metadata
function extractProductMetadata(url) {
    const urlParts = url.split('/');
    const pathSegments = urlParts.filter(segment =>
        segment && !['http:', 'https:', '', 'www.bestsanitizers.com'].includes(segment)
    );

    let category = 'general';
    let productType = '';

    // Check for product pages first
    if (pathSegments.includes('product')) {
        const productIndex = pathSegments.indexOf('product');
        if (productIndex + 1 < pathSegments.length) {
            category = pathSegments[productIndex + 1];
            productType = category;
        }
    }
    // Check for category patterns in URL segments
    else {
        for (const segment of pathSegments) {
            if (segment.includes('hand-sanitizer')) {
                category = 'hand-sanitizers';
                productType = 'hand-sanitizers';
                break;
            } else if (segment.includes('surface-sanitizer')) {
                category = 'surface-sanitizers';
                productType = 'surface-sanitizers';
                break;
            } else if (segment.includes('dispenser') || segment.includes('dispensing')) {
                category = 'dispensers';
                productType = 'dispensers';
                break;
            } else if (segment.includes('wipe') || segment.includes('wiping')) {
                category = 'disinfectant-wipes';
                productType = 'disinfectant-wipes';
                break;
            } else if (segment.includes('soap')) {
                category = 'hand-soaps';
                productType = 'hand-soaps';
                break;
            } else if (segment.includes('peracetic') || segment.includes('paa')) {
                category = 'peracetic-acid';
                productType = 'peracetic-acid';
                break;
            } else if (segment.includes('footwear')) {
                category = 'footwear-hygiene';
                productType = 'footwear-hygiene';
                break;
            } else if (segment.includes('industrial')) {
                category = 'industrial-cleaners';
                productType = 'industrial-cleaners';
                break;
            }
        }
    }

    return {
        category: category.replace(/-/g, ' '),
        productType: productType.replace(/-/g, ' '),
        urlSegments: pathSegments,
        pageUrl: url
    };
}

const crawler = new PuppeteerCrawler({
    maxConcurrency: 1,
    requestHandlerTimeoutSecs: 60,

    async requestHandler({ request, page, enqueueLinks, log }) {
        const url = request.url;
        console.log(`\n🔍 Processing: ${url}`);

        try {
            // Wait for page load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Extract metadata
            const baseMetadata = extractProductMetadata(url);

            // Get title safely
            let title = '';
            try {
                title = await page.title();
            } catch (e) {
                console.log('Could not get title');
            }

            // Get meta description safely
            let metaDescription = '';
            try {
                metaDescription = await page.evaluate(() => {
                    const meta = document.querySelector('meta[name="description"]');
                    return meta ? meta.content : '';
                });
            } catch (e) {
                console.log('Could not get meta description');
            }

            // Get product name
            let productName = title;
            const productSelectors = ['h1', '.product-title', '.entry-title', '.page-title'];
            for (const selector of productSelectors) {
                try {
                    const name = await page.evaluate((sel) => {
                        const elem = document.querySelector(sel);
                        return elem ? elem.textContent.trim() : '';
                    }, selector);
                    if (name && name.length > 0) {
                        productName = name;
                        break;
                    }
                } catch (e) {}
            }

            // Extract keywords from page text
            let pageText = '';
            try {
                pageText = await page.evaluate(() => {
                    return document.body ? document.body.textContent || '' : '';
                });
            } catch (e) {
                console.log('Could not get page text');
            }

            const keywords = [];
            const keywordPatterns = [
                /sanitiz\w+/gi, /disinfect\w+/gi, /clean\w+/gi, /soap\w*/gi,
                /foam\w*/gi, /gel\w*/gi, /alcohol\w*/gi, /antibacterial/gi,
                /antimicrobial/gi, /virus\w*/gi, /bacteria\w*/gi, /germ\w*/gi,
                /hygiene/gi, /healthcare/gi, /medical/gi, /hospital/gi,
                /food.?service/gi, /industrial/gi
            ];

            keywordPatterns.forEach(pattern => {
                const matches = pageText.match(pattern);
                if (matches) {
                    keywords.push(...matches.map(m => m.toLowerCase()));
                }
            });

            const metadata = {
                ...baseMetadata,
                productName: productName || title || 'Unknown Product',
                title,
                metaDescription,
                keywords: [...new Set(keywords)],
                extractedAt: new Date().toISOString()
            };

            console.log(`📝 Product: ${metadata.productName}`);
            console.log(`📂 Category: ${metadata.category}`);
            console.log(`🏷️ Keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`);

            // Save metadata
            const metadataFile = path.join(METADATA_DIR, `${slug(url.replace(/[^a-zA-Z0-9]/g, '-'))}.json`);
            await fs.writeJSON(metadataFile, metadata, { spaces: 2 });

            // Get all images
            let images = [];
            try {
                images = await page.evaluate(() => {
                    const imgs = document.querySelectorAll('img');
                    return Array.from(imgs).map(img => ({
                        src: img.src,
                        alt: img.alt || '',
                        title: img.title || ''
                    })).filter(img =>
                        img.src &&
                        !img.src.startsWith('data:') &&
                        img.src.includes('http')
                    );
                });
            } catch (e) {
                console.log('Could not extract images');
            }

            console.log(`🖼️ Found ${images.length} images`);

            // Download images
            let downloadCount = 0;
            for (let i = 0; i < Math.min(images.length, 10); i++) { // Limit to 10 images per page
                const img = images[i];
                try {
                    const imgUrl = img.src;
                    const imgExtension = path.extname(new URL(imgUrl).pathname) || '.jpg';
                    const imgFilename = `${slug(metadata.productName)}-${i + 1}-${Date.now()}${imgExtension}`;
                    const categoryFolder = metadata.category.replace(/\s+/g, '-');
                    const imgPath = path.join(IMAGES_DIR, categoryFolder, imgFilename);

                    const downloadResult = await downloadFile(imgUrl, imgPath, {
                        ...metadata,
                        altText: img.alt,
                        imageTitle: img.title
                    });

                    if (downloadResult && process.env.CLOUDINARY_CLOUD_NAME) {
                        await uploadToCloudinary(downloadResult.localPath, downloadResult.metadata);
                        downloadCount++;
                    }
                } catch (error) {
                    console.error(`Failed to process image: ${error.message}`);
                }
            }

            console.log(`✅ Downloaded ${downloadCount} images`);

            // Save to dataset
            await Dataset.pushData({
                url,
                ...metadata,
                images: images.length,
                downloadedImages: downloadCount,
                processedAt: new Date().toISOString()
            });

            // Find more pages to crawl
            try {
                await enqueueLinks({
                    selector: 'a[href*="/product/"], a[href*="/category/"], a[href*="sanitizer"], a[href*="dispenser"], a[href*="wipe"], a[href*="soap"]',
                    limit: 20,
                });
            } catch (e) {
                console.log('Could not enqueue links');
            }

        } catch (error) {
            console.error(`❌ Error processing ${url}:`, error.message);
        }
    },

    failedRequestHandler({ request, log }) {
        console.error(`❌ Request failed: ${request.url}`);
    },
});

console.log('🚀 Starting BestSanitizers.com crawler...');
console.log(`📁 Images: ${IMAGES_DIR}`);
console.log(`📄 Documents: ${DOCUMENTS_DIR}`);
console.log(`📊 Metadata: ${METADATA_DIR}`);
console.log(`☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Enabled' : 'Disabled'}`);

await crawler.run(['https://www.bestsanitizers.com/']);

console.log('🎉 Crawling completed!');