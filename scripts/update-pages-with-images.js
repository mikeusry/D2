/**
 * Update site pages with actual Cloudinary images based on mapping
 * Only uses images from their corresponding pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the image mapping
const mappingPath = path.join(__dirname, '..', 'd2-image-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

console.log('📸 Updating site pages with actual images...\n');
console.log(`Found ${mapping.length} mapped images\n`);

// Group images by page type and page URL
const imagesByPage = {};
mapping.forEach(img => {
  if (!imagesByPage[img.pageUrl]) {
    imagesByPage[img.pageUrl] = [];
  }
  imagesByPage[img.pageUrl].push(img);
});

// Category page mappings
const categoryUpdates = {
  'hand-sanitizers': {
    file: '/Users/mikeusry/CODING/D2/src/pages/hand-sanitizers.astro',
    heroImageField: 'hand-sanitizers-dispensing',
    pages: [
      'https://www.d2sanitizers.com/hand-sanitizers',
      'Top Hand Sanitizer Products | D2 Sanitizers'
    ]
  },
  'surface-sanitizers': {
    file: '/Users/mikeusry/CODING/D2/src/pages/surface-sanitizers.astro',
    heroImageField: 'surface-sanitizers',
    pages: [
      'https://www.d2sanitizers.com/surface-sanitizers',
      'Surface Sanitizers | D2 Surface Sanitizers Collection'
    ]
  },
  'floor-sanitizers': {
    file: '/Users/mikeusry/CODING/D2/src/pages/floor-sanitizers.astro',
    heroImageField: 'floor-sanitizers',
    pages: [
      'https://www.d2sanitizers.com/floor-sanitizers',
      'Floor Sanitizers for Food Service'
    ]
  },
  'disinfectant-wipes': {
    file: '/Users/mikeusry/CODING/D2/src/pages/disinfectant-wipes.astro',
    heroImageField: 'disinfectant-wipes',
    pages: [
      'https://www.d2sanitizers.com/disinfectant-wipes',
      'Food Safe Wipes | D2 Disinfectant Wipes'
    ]
  },
  'dispensers': {
    file: '/Users/mikeusry/CODING/D2/src/pages/dispensers.astro',
    heroImageField: 'dispensing-options',
    pages: [
      'https://www.d2sanitizers.com/dispensers',
      'Advanced Chemical Dispenser System | D2 Sanitizers'
    ]
  },
  'peracetic-acid': {
    file: '/Users/mikeusry/CODING/D2/src/pages/peracetic-acid.astro',
    heroImageField: 'peracetic-acid',
    pages: [
      'https://www.d2sanitizers.com/peracetic-acid',
      'Peracetic Acid Sanitizer | D2 Sanitizers'
    ]
  },
  'industrial-hand-soap': {
    file: '/Users/mikeusry/CODING/D2/src/pages/industrial-hand-soap.astro',
    heroImageField: 'hand-soaps',
    pages: [
      'https://www.d2sanitizers.com/industrial-hand-soap',
      'Industrial Hand Soap | D2 Sanitizers'
    ]
  }
};

// Product examples mapping (for updating product template examples)
const productExamples = {
  'alpet-d2-surface-sanitizer': {
    page: 'https://www.d2sanitizers.com/product/alpet-d2-surface-sanitizer',
    title: 'Alpet D2 Surface Sanitizer Spray'
  }
};

// Create updates report
const updates = {
  categories: [],
  products: [],
  blog: []
};

// Find images for each category
Object.keys(categoryUpdates).forEach(categoryKey => {
  const category = categoryUpdates[categoryKey];

  // Find images from this category's pages
  const categoryImages = [];
  category.pages.forEach(pageIdentifier => {
    Object.keys(imagesByPage).forEach(pageUrl => {
      if (pageUrl.includes(pageIdentifier) || imagesByPage[pageUrl][0]?.page?.includes(pageIdentifier)) {
        categoryImages.push(...imagesByPage[pageUrl]);
      }
    });
  });

  if (categoryImages.length > 0) {
    // Pick the best hero image (first one usually)
    const heroImage = categoryImages[0];

    updates.categories.push({
      category: categoryKey,
      file: category.file,
      heroImage: heroImage.cloudinaryPublicId,
      totalImages: categoryImages.length,
      allImages: categoryImages.map(img => ({
        publicId: img.cloudinaryPublicId,
        alt: img.alt || img.page
      }))
    });
  }
});

// Find product images
Object.keys(productExamples).forEach(productKey => {
  const product = productExamples[productKey];
  const productImages = imagesByPage[product.page] || [];

  if (productImages.length > 0) {
    updates.products.push({
      product: productKey,
      title: product.title,
      images: productImages.map(img => ({
        publicId: img.cloudinaryPublicId,
        url: img.cloudinaryUrl,
        alt: img.alt || product.title
      }))
    });
  }
});

// Find blog images
mapping.filter(img => img.pageType === 'blog').forEach(img => {
  updates.blog.push({
    page: img.page,
    pageUrl: img.pageUrl,
    image: {
      publicId: img.cloudinaryPublicId,
      url: img.cloudinaryUrl,
      alt: img.alt || img.page
    }
  });
});

// Save the updates file
const updatesPath = path.join(__dirname, '..', 'd2-page-updates.json');
fs.writeFileSync(updatesPath, JSON.stringify(updates, null, 2));

console.log('✅ Analysis complete!\n');
console.log('📊 Summary:');
console.log(`   Category pages with images: ${updates.categories.length}`);
console.log(`   Product examples: ${updates.products.length}`);
console.log(`   Blog images: ${updates.blog.length}`);
console.log('\n📁 Saved to: d2-page-updates.json\n');

// Print category updates
console.log('📄 CATEGORY UPDATES:\n');
updates.categories.forEach(cat => {
  console.log(`${cat.category}:`);
  console.log(`  Hero Image: ${cat.heroImage}`);
  console.log(`  Total Images: ${cat.totalImages}`);
  console.log('');
});

// Print instructions
console.log('\n' + '='.repeat(60));
console.log('📝 NEXT STEPS:\n');
console.log('1. Review d2-page-updates.json for all image mappings');
console.log('2. Update category pages with hero images');
console.log('3. Update product template examples');
console.log('4. Verify images display correctly on site');
console.log('='.repeat(60));