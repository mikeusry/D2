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

// Create directories for storing downloaded files
const IMAGES_DIR = path.join(__dirname, 'crawled-data', 'images');
const DOCUMENTS_DIR = path.join(__dirname, 'crawled-data', 'documents');
const METADATA_DIR = path.join(__dirname, 'crawled-data', 'metadata');

await fs.ensureDir(IMAGES_DIR);
await fs.ensureDir(DOCUMENTS_DIR);
await fs.ensureDir(METADATA_DIR);

// Helper function to download files
async function downloadFile(url, localPath, metadata = {}) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            timeout: 30000,
        });

        await fs.ensureDir(path.dirname(localPath));
        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Downloaded: ${url} -> ${localPath}`);
                resolve({ localPath, metadata, originalUrl: url });
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${url}:`, error.message);
        return null;
    }
}

// Helper function to upload to Cloudinary with metadata
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

        console.log(`Uploaded to Cloudinary: ${result.public_id}`);
        return result;
    } catch (error) {
        console.error(`Failed to upload ${localPath} to Cloudinary:`, error.message);
        return null;
    }
}

// Extract product information and keywords from page content
function extractProductMetadata(url) {
    const urlParts = url.split('/');
    const pathSegments = urlParts.filter(segment => segment && !['http:', 'https:', '', 'www.bestsanitizers.com'].includes(segment));

    // Determine category from URL structure
    let category = 'general';
    let productType = '';

    if (pathSegments.includes('product')) {
        const productIndex = pathSegments.indexOf('product');
        if (productIndex + 1 < pathSegments.length) {
            category = pathSegments[productIndex + 1];
            productType = category;
        }
    } else if (pathSegments.length > 0) {
        // Try to extract category from first path segment
        const firstSegment = pathSegments[0];
        if (['hand-sanitizers', 'surface-sanitizers', 'dispensers', 'disinfectant-wipes', 'floor-sanitizers', 'industrial-hand-soap', 'peracetic-acid'].includes(firstSegment)) {
            category = firstSegment;
            productType = firstSegment;
        }
    }

    return {
        category: category.replace(/-/g, ' '),
        productType: productType.replace(/-/g, ' '),
        urlSegments: pathSegments,
        pageUrl: url
    };
}

// Main crawler configuration
const crawler = new PuppeteerCrawler({
    maxConcurrency: 2,
    requestHandlerTimeoutSecs: 120,
    navigationTimeoutSecs: 60,

    async requestHandler({ request, page, enqueueLinks, log }) {
        const url = request.url;
        log.info(`Processing ${url}`);

        try {
            // Wait for page to load
            await page.waitForTimeout(3000);

            // Extract basic metadata
            const baseMetadata = extractProductMetadata(url);

            // Extract page title and meta description
            const title = await page.title();
            const metaDescription = await page.evaluate(() => {
                const meta = document.querySelector('meta[name="description"]');
                return meta ? meta.content : '';
            });
            const metaKeywords = await page.evaluate(() => {
                const meta = document.querySelector('meta[name="keywords"]');
                return meta ? meta.content : '';
            });

            // Extract product name from various selectors
            let productName = '';
            const productSelectors = [
                'h1',
                '.product-title',
                '.product-name',
                '[data-testid="product-title"]',
                '.entry-title'
            ];

            for (const selector of productSelectors) {
                try {
                    productName = await page.evaluate((sel) => {
                        const elem = document.querySelector(sel);
                        return elem ? elem.textContent.trim() : '';
                    }, selector);
                    if (productName) break;
                } catch (e) {}
            }

            // Extract all text content for keyword analysis
            const pageText = await page.evaluate(() => document.body.textContent || '');

            // Generate keywords from content
            const keywords = [];
            const keywordPatterns = [
                /sanitiz\w+/gi,
                /disinfect\w+/gi,
                /clean\w+/gi,
                /soap\w*/gi,
                /foam\w*/gi,
                /gel\w*/gi,
                /alcohol\w*/gi,
                /antibacterial/gi,
                /antimicrobial/gi,
                /virus\w*/gi,
                /bacteria\w*/gi,
                /germ\w*/gi,
                /hygiene/gi,
                /healthcare/gi,
                /medical/gi,
                /hospital/gi,
                /food service/gi,
                /industrial/gi
            ];

            keywordPatterns.forEach(pattern => {
                const matches = pageText.match(pattern);
                if (matches) {
                    keywords.push(...matches.map(m => m.toLowerCase()));
                }
            });

            const metadata = {
                ...baseMetadata,
                productName: productName || title,
                title,
                metaDescription,
                metaKeywords: metaKeywords.split(',').map(k => k.trim()).filter(Boolean),
                keywords: [...new Set(keywords)], // Remove duplicates
                extractedAt: new Date().toISOString()
            };

            // Save page metadata
            const metadataFile = path.join(METADATA_DIR, `${slug(url.replace(/[^a-zA-Z0-9]/g, '-'))}.json`);
            await fs.writeJSON(metadataFile, metadata, { spaces: 2 });

            // Find and download all images
            const images = await page.evaluate(() => {
                const imgs = document.querySelectorAll('img');
                return Array.from(imgs).map(img => ({
                    src: img.src,
                    alt: img.alt || '',
                    title: img.title || '',
                    className: img.className || ''
                })).filter(img => img.src && !img.src.startsWith('data:'));
            });

            for (const img of images) {
                try {
                    const imgUrl = new URL(img.src, url).href;
                    const imgExtension = path.extname(new URL(imgUrl).pathname) || '.jpg';
                    const imgFilename = `${slug(metadata.productName || 'image')}-${Date.now()}${imgExtension}`;
                    const imgPath = path.join(IMAGES_DIR, metadata.category.replace(/\s+/g, '-'), imgFilename);

                    const downloadResult = await downloadFile(imgUrl, imgPath, {
                        ...metadata,
                        altText: img.alt,
                        imageTitle: img.title,
                        className: img.className
                    });

                    if (downloadResult && process.env.CLOUDINARY_CLOUD_NAME) {
                        await uploadToCloudinary(downloadResult.localPath, downloadResult.metadata);
                    }
                } catch (error) {
                    log.error(`Failed to process image ${img.src}:`, error.message);
                }
            }

            // Find and download documents
            const documentLinks = await page.evaluate(() => {
                const links = document.querySelectorAll('a');
                return Array.from(links).map(link => ({
                    href: link.href,
                    text: link.textContent.trim(),
                    title: link.title || ''
                })).filter(link =>
                    link.href &&
                    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i.test(link.href)
                );
            });

            for (const doc of documentLinks) {
                try {
                    const docUrl = new URL(doc.href, url).href;
                    const docExtension = path.extname(new URL(docUrl).pathname);
                    const docFilename = `${slug(doc.text || 'document')}-${Date.now()}${docExtension}`;
                    const docPath = path.join(DOCUMENTS_DIR, metadata.category.replace(/\s+/g, '-'), docFilename);

                    await downloadFile(docUrl, docPath, {
                        ...metadata,
                        documentTitle: doc.text,
                        documentUrl: docUrl
                    });
                } catch (error) {
                    log.error(`Failed to process document ${doc.href}:`, error.message);
                }
            }

            // Save comprehensive data to dataset
            await Dataset.pushData({
                url,
                ...metadata,
                images: images.length,
                documents: documentLinks.length,
                processedAt: new Date().toISOString()
            });

            // Enqueue product and category pages
            await enqueueLinks({
                selector: 'a[href*="/product/"], a[href*="/category/"], a[href*="sanitizer"], a[href*="dispenser"], a[href*="wipe"], a[href*="soap"]',
                baseUrl: url,
            });

        } catch (error) {
            log.error(`Error processing ${url}:`, error);
        }
    },

    failedRequestHandler({ request, log }) {
        log.error(`Request ${request.url} failed multiple times`);
    },
});

// Start crawling
console.log('Starting BestSanitizers.com crawler...');
console.log(`Images will be saved to: ${IMAGES_DIR}`);
console.log(`Documents will be saved to: ${DOCUMENTS_DIR}`);
console.log(`Metadata will be saved to: ${METADATA_DIR}`);

if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('Cloudinary upload enabled');
} else {
    console.log('Cloudinary upload disabled - set CLOUDINARY_* environment variables to enable');
}

await crawler.run(['https://www.bestsanitizers.com/']);

console.log('Crawling completed!');