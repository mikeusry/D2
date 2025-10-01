# D2 Sanitizers - Image & Document Crawler Setup

This guide will help you crawl the existing D2 Sanitizers website, capture all images and documents, and upload them to Cloudinary with proper organization.

## Step 1: Run Apify Web Crawler

### Option A: Using Apify Console (Recommended)

1. **Go to Apify Console**
   - Visit: https://console.apify.com/
   - Sign in or create a free account

2. **Create New Web Scraper**
   - Click "Actors" → "Web Scraper"
   - Click "Try for free" or "Use"

3. **Configure the Crawler**

   **Start URLs:**
   ```
   https://www.d2sanitizers.com
   ```

   **Settings:**
   - ✅ Enable "Crawl all pages on the same domain"
   - Set Max depth: 3
   - Set Max pages: 200 (or unlimited if you have credits)

   **Page Function:**
   - Copy the entire contents of `apify-image-crawler.js`
   - Paste it into the "Page function" field in Apify

4. **Run the Crawler**
   - Click "Save & Start"
   - Wait for the crawler to finish (5-15 minutes)

5. **Download Results**
   - Click "Export results" → "JSON"
   - Save the file as `d2-images-crawl.json` in your project root

### Option B: Using Apify CLI

```bash
# Install Apify CLI
npm install -g apify-cli

# Initialize and run (after setting up credentials)
apify run
```

## Step 2: Set Up Cloudinary Credentials

1. **Get Your Cloudinary Credentials**
   - Go to: https://cloudinary.com/console
   - Find your:
     - Cloud Name: `southland-organics`
     - API Key
     - API Secret

2. **Add to .env File**
   ```bash
   # Add these to /Users/mikeusry/CODING/D2/.env
   CLOUDINARY_CLOUD_NAME=southland-organics
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## Step 3: Install Dependencies

```bash
cd /Users/mikeusry/CODING/D2
npm install cloudinary
```

## Step 4: Run Upload Script

```bash
# Make sure d2-images-crawl.json is in the project root
node scripts/upload-to-cloudinary.js
```

## What the Script Does

1. **Reads the crawl data** from `d2-images-crawl.json`
2. **Downloads each image** to a temporary folder
3. **Uploads to Cloudinary** with organized folder structure:
   - `d2-sanitizers/homepage/` - Homepage images
   - `d2-sanitizers/products/` - Product images
   - `d2-sanitizers/categories/` - Category page images
   - `d2-sanitizers/blog/` - Blog images
   - `d2-sanitizers/industries/` - Industry page images
   - `d2-sanitizers/about/` - About page images
   - `d2-sanitizers/general/` - Other images
4. **Creates mapping file** (`d2-image-mapping.json`) that shows:
   - Original URL → New Cloudinary URL
   - Which page each image belongs to
   - Image context and alt text

## Step 5: Review the Mapping

After the upload completes, check `d2-image-mapping.json`:

```json
[
  {
    "originalUrl": "https://www.d2sanitizers.com/images/product.jpg",
    "cloudinaryPublicId": "d2-sanitizers/products/alpet-d2-surface-sanitizer",
    "cloudinaryUrl": "https://res.cloudinary.com/southland-organics/image/upload/v1234567890/d2-sanitizers/products/alpet-d2-surface-sanitizer.jpg",
    "page": "https://www.d2sanitizers.com/product/alpet-d2-surface-sanitizer",
    "pageType": "product",
    "alt": "Alpet D2 Surface Sanitizer",
    "context": "Product Hero"
  }
]
```

## Step 6: Update Site Pages

Now you can use the mapping to update your Astro pages with the correct Cloudinary URLs.

### Manual Update Example:

```astro
<!-- Before -->
<CloudinaryImage
  publicId="d2-sanitizers/products/placeholder"
  alt="Product"
  width={800}
  height={800}
/>

<!-- After (using mapping) -->
<CloudinaryImage
  publicId="d2-sanitizers/products/alpet-d2-surface-sanitizer"
  alt="Alpet D2 Surface Sanitizer"
  width={800}
  height={800}
/>
```

## Folder Structure in Cloudinary

```
southland-organics/
└── d2-sanitizers/
    ├── homepage/          # Homepage hero, features
    ├── products/          # All product images
    ├── categories/        # Category hero images
    ├── blog/             # Blog post featured images
    ├── industries/       # Industry page images
    ├── about/            # About page images
    ├── contact/          # Contact page images
    ├── trust/            # Trust badges, certifications
    └── general/          # Other images
```

## Handling Documents (PDFs, SDS)

Documents will be captured in the crawl data under:
- `documents` array
- `sdsReferences` array

These need to be handled separately:

1. **Download PDFs manually** or create a separate download script
2. **Upload to Cloudinary** as raw files:
   ```javascript
   cloudinary.uploader.upload('path/to/document.pdf', {
     resource_type: 'raw',
     folder: 'd2-sanitizers/documents',
     public_id: 'alpet-d2-sds'
   });
   ```

3. **Or store in `/public/documents/`** folder in your project

## Troubleshooting

### "d2-images-crawl.json not found"
- Make sure you've downloaded the Apify results
- Save it in the project root: `/Users/mikeusry/CODING/D2/`

### "Cloudinary API credentials required"
- Check your `.env` file
- Make sure all three credentials are set
- Restart your terminal after adding .env

### "Upload failed" errors
- Check your Cloudinary account limits
- Some images might be too large or corrupted
- Script will continue with other images

### External images skipped
- The script only uploads images from:
  - d2sanitizers.com
  - website-files.com (Webflow CDN)
  - cloudinary.com
- External images (icons, social media) are skipped

## Next Steps

After uploading:

1. ✅ Review `d2-image-mapping.json`
2. ✅ Update product pages with actual image public IDs
3. ✅ Update category pages with hero images
4. ✅ Update blog posts with featured images
5. ✅ Test all pages to ensure images load correctly
6. ✅ Download and organize PDF documents separately

## Questions?

- Check Cloudinary console: https://cloudinary.com/console
- Review uploaded images in Media Library
- Test image URLs in browser
- Check the mapping file for any missing images