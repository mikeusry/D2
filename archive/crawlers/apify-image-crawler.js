/**
 * Apify Web Scraper for D2 Sanitizers
 * Captures all images, PDFs, and documents with page mapping
 *
 * To use this crawler:
 * 1. Go to https://console.apify.com/
 * 2. Create a new "Web Scraper" actor
 * 3. Paste this code into the Page function
 * 4. Set Start URLs to: https://www.d2sanitizers.com
 * 5. Enable "Crawl all pages on the same domain"
 */

async function pageFunction(context) {
    const { request, log, skipLinks, $ } = context;

    const title = $('title').text();
    const url = request.url;

    log.info(`Processing: ${title} - ${url}`);

    // Extract all images with their attributes
    const images = [];
    $('img').each((index, element) => {
        const $img = $(element);
        const src = $img.attr('src');
        const alt = $img.attr('alt') || '';
        const className = $img.attr('class') || '';
        const parent = $img.parent().prop('tagName');

        if (src) {
            // Resolve relative URLs
            let fullUrl = src;
            if (!src.startsWith('http')) {
                const baseUrl = new URL(url);
                fullUrl = new URL(src, baseUrl.origin).href;
            }

            images.push({
                url: fullUrl,
                alt: alt,
                className: className,
                parent: parent,
                context: getImageContext($img)
            });
        }
    });

    // Extract background images from CSS
    const backgroundImages = [];
    $('[style*="background"]').each((index, element) => {
        const style = $(element).attr('style');
        const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
            let fullUrl = urlMatch[1];
            if (!fullUrl.startsWith('http')) {
                const baseUrl = new URL(url);
                fullUrl = new URL(fullUrl, baseUrl.origin).href;
            }
            backgroundImages.push({
                url: fullUrl,
                type: 'background',
                element: $(element).prop('tagName')
            });
        }
    });

    // Extract all document links (PDFs, docs, etc.)
    const documents = [];
    $('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href*="download"]').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const text = $link.text().trim();

        if (href) {
            let fullUrl = href;
            if (!href.startsWith('http')) {
                const baseUrl = new URL(url);
                fullUrl = new URL(href, baseUrl.origin).href;
            }

            documents.push({
                url: fullUrl,
                text: text,
                type: getDocumentType(fullUrl),
                context: $link.closest('section').find('h1, h2, h3').first().text().trim()
            });
        }
    });

    // Look for SDS/MSDS references
    const sdsReferences = [];
    $('a:contains("SDS"), a:contains("Safety Data"), a:contains("MSDS"), a:contains("Data Sheet")').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const text = $link.text().trim();

        if (href && !documents.some(d => d.url === href)) {
            let fullUrl = href;
            if (!href.startsWith('http')) {
                const baseUrl = new URL(url);
                fullUrl = new URL(href, baseUrl.origin).href;
            }
            sdsReferences.push({
                url: fullUrl,
                text: text,
                type: 'SDS'
            });
        }
    });

    // Determine page type for mapping
    const pageType = categorizePageType(url, title);

    // Helper function to get image context
    function getImageContext($img) {
        const section = $img.closest('section, div[class*="section"], article');
        const heading = section.find('h1, h2, h3').first().text().trim();
        return heading || 'general';
    }

    // Helper function to determine document type
    function getDocumentType(url) {
        if (url.includes('.pdf')) return 'PDF';
        if (url.includes('.doc')) return 'DOC';
        if (url.includes('.xls')) return 'EXCEL';
        if (url.toLowerCase().includes('sds') || url.toLowerCase().includes('msds')) return 'SDS';
        return 'DOCUMENT';
    }

    // Helper function to categorize page type
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
        if (url === 'https://www.d2sanitizers.com' || url === 'https://www.d2sanitizers.com/') return 'homepage';
        return 'other';
    }

    // Return structured data
    return {
        url: url,
        title: title,
        pageType: pageType,
        images: images,
        backgroundImages: backgroundImages,
        documents: documents,
        sdsReferences: sdsReferences,
        totalImages: images.length + backgroundImages.length,
        totalDocuments: documents.length + sdsReferences.length,
        timestamp: new Date().toISOString()
    };
}