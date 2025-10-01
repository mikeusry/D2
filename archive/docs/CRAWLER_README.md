# BestSanitizers.com Crawler

A comprehensive web crawler built with Crawlee to extract data, images, and documents from bestsanitizers.com for your D2 project rebuild.

## Features

- **Comprehensive Data Extraction**: Extracts product names, categories, keywords, and metadata
- **Smart Categorization**: Automatically categorizes products based on URL structure (hand-sanitizers, surface-sanitizers, dispensers, etc.)
- **Image Download**: Downloads all images with metadata preservation
- **Document Collection**: Finds and downloads PDFs, documents, and other files
- **Cloudinary Integration**: Automatically uploads images to Cloudinary with proper tagging and metadata
- **Keyword Extraction**: Intelligently extracts relevant keywords from page content
- **Structured Data**: Saves all metadata in JSON format for easy processing

## Setup

1. **Install Dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure Cloudinary** (optional but recommended):
   ```bash
   cp .env.example .env
   # Edit .env with your Cloudinary credentials
   ```

3. **Run the Crawler**:
   ```bash
   npm run crawl-bestsanitizers
   ```

## Output Structure

```
crawled-data/
├── images/
│   ├── hand-sanitizers/
│   ├── surface-sanitizers/
│   ├── dispensers/
│   └── ...
├── documents/
│   ├── hand-sanitizers/
│   └── ...
└── metadata/
    ├── page-1.json
    ├── page-2.json
    └── ...
```

## Metadata Structure

Each page generates a JSON file with:
- Product name and category
- Extracted keywords
- Meta description and title
- URL structure analysis
- Image and document counts
- Cloudinary upload results (if configured)

## Example Usage

The crawler will automatically:
1. Start at https://www.bestsanitizers.com/
2. Discover product and category pages
3. Extract product information like "Alpet E2 Sanitizing Foam Soap" from hand-soap category
4. Download images with proper naming: `alpet-e2-sanitizing-foam-soap-123456.jpg`
5. Upload to Cloudinary under folder: `d2-sanitizers/hand-sanitizers/`
6. Tag with relevant keywords: `sanitizer`, `foam`, `soap`, `hand-sanitizer`

## Cloudinary Integration

Images are uploaded with:
- **Folder structure**: `d2-sanitizers/{category}/`
- **Tags**: Product type, category, extracted keywords
- **Context metadata**: Source URL, product name, crawl date
- **Public ID**: Slugified product name with timestamp

## Configuration

Modify the crawler by editing `bestsanitizers-crawler.js`:
- Adjust concurrency settings
- Modify keyword extraction patterns
- Change folder structures
- Add custom selectors for specific data

## Notes

- The crawler respects rate limits with 2 concurrent requests
- Failed downloads are logged but don't stop the crawling process
- All metadata is preserved for later analysis and processing
- Images are organized by product category for easy management