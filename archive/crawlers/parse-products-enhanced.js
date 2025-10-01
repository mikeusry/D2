import fs from 'fs';

// Load the crawled data
const data = JSON.parse(fs.readFileSync('./d2-apify-crawl.json', 'utf8'));

// Category mapping to the 6 main homepage categories
const categoryMapping = {
  'hand-sanitizers': 'Hand Sanitizers',
  'industrial-hand-soap': 'Hand Soaps',
  'hand-soap': 'Hand Soaps',
  'floor-sanitizers': 'Floor Sanitizers for Food Service',
  'surface-sanitizers': 'Floor Sanitizers for Food Service',
  'disinfectant-wipes': 'Food Safe Disinfectant Wipes',
  'wipes': 'Food Safe Disinfectant Wipes',
  'dispensers': 'Dispensing Options',
  'dispenser': 'Dispensing Options',
  'peracetic-acid': 'Peracetic Acid Products',
  'paa': 'Peracetic Acid Products',
  'shoe-sanitizer': 'Floor Sanitizers for Food Service',
  'footwear': 'Floor Sanitizers for Food Service'
};

// Product-specific category determination based on product name/description
function determineCategory(productName, description) {
  const combined = (productName + ' ' + description).toLowerCase();

  // Peracetic Acid products
  if (combined.includes('paa') || combined.includes('peracetic') || combined.includes('pera fc')) {
    return 'Peracetic Acid Products';
  }

  // Hand Sanitizers
  if (combined.includes('hand sanitizer') || combined.includes('e3 plus') || combined.includes('alpet e3') ||
      combined.includes('smart san hand')) {
    return 'Hand Sanitizers';
  }

  // Hand Soaps
  if (combined.includes('hand soap') || combined.includes('hand cleaner') || combined.includes('foam soap') ||
      combined.includes('liquid soap') || combined.includes('alpet e2') || combined.includes('alpet e1') ||
      combined.includes('alpet e4') || combined.includes('alpet q e2') || combined.includes('haccp q e2') ||
      combined.includes('softensure')) {
    return 'Hand Soaps';
  }

  // Wipes
  if (combined.includes('wipe')) {
    return 'Food Safe Disinfectant Wipes';
  }

  // Dispensers
  if (combined.includes('dispenser') || combined.includes('foamer') || combined.includes('versaclenz') ||
      combined.includes('ez step') || combined.includes('dema') || combined.includes('attachment')) {
    return 'Dispensing Options';
  }

  // Surface/Floor sanitizers
  if (combined.includes('surface sanitizer') || combined.includes('alpet d2') || combined.includes('quat sanitizer') ||
      combined.includes('floor treatment') || combined.includes('footwear sanitiz') || combined.includes('smartstep') ||
      combined.includes('dry step') || combined.includes('shoe') || combined.includes('boot')) {
    return 'Floor Sanitizers for Food Service';
  }

  // Warewashing products
  if (combined.includes('warewashing') || combined.includes('detergent')) {
    return 'Floor Sanitizers for Food Service';
  }

  return null;
}

// Extract price from markdown/text
function extractPrice(markdown, text) {
  // Pattern 1: $XXX.XX format
  const pricePattern1 = /\$([0-9,]+\.?[0-9]*)/;
  const match1 = markdown.match(pricePattern1);
  if (match1 && parseFloat(match1[1].replace(/,/g, '')) > 0) {
    return parseFloat(match1[1].replace(/,/g, ''));
  }

  // Pattern 2: Price not listed / contact for quote
  return null;
}

// Extract description
function extractDescription(markdown) {
  // Get the first paragraph after the title
  const paragraphs = markdown.split('\n\n');
  for (let para of paragraphs) {
    if (para.startsWith('#') || para.startsWith('*') || para.startsWith('$') ||
        para.includes('Variant Selector') || para.includes('Thank you')) {
      continue;
    }
    if (para.trim().length > 50) {
      return para.trim().substring(0, 300);
    }
  }
  return '';
}

// Extract product image
function extractImage(markdown) {
  const imagePattern = /!\[([^\]]*)\]\((https:\/\/cdn\.prod\.website-files\.com[^\)]+)\)/;
  const match = markdown.match(imagePattern);
  return match ? match[2] : '';
}

// Parse individual product pages
const productPages = data.filter(page => page.url && page.url.includes('/product/'));

console.log(`Found ${productPages.length} product pages`);

const products = [];

productPages.forEach(page => {
  const slug = page.url.split('/').pop();
  const title = page.metadata?.title?.split('|')[0].trim() || '';
  const markdown = page.markdown || '';
  const text = page.text || '';

  const price = extractPrice(markdown, text);
  const image = extractImage(markdown);
  const description = extractDescription(markdown);
  const category = determineCategory(title, description);

  if (category) {
    products.push({
      name: title,
      slug: slug,
      price: price,
      image: image,
      description: description,
      category: category,
      productUrl: page.url
    });
  }
});

// Deduplicate by slug
const uniqueProducts = [];
const seenSlugs = new Set();

products.forEach(product => {
  if (!seenSlugs.has(product.slug)) {
    seenSlugs.add(product.slug);
    uniqueProducts.push(product);
  }
});

console.log(`Extracted ${uniqueProducts.length} unique products`);

// Count by category
const countByCategory = {};
uniqueProducts.forEach(p => {
  countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
});

console.log('\nProducts per category:');
Object.entries(countByCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} products`);
});

// Main categories
const mainCategories = [
  {
    name: 'Hand Sanitizers',
    slug: 'hand-sanitizers',
    description: 'Get your hands on the best hand sanitizer products from D2 Sanitizers. Stay germ-free with our effective sanitizing solutions.',
    url: 'https://www.d2sanitizers.com/hand-sanitizers',
    image: 'https://cdn.prod.website-files.com/671129b3a7365cecb0df175c/67139ef2c33a68ca4b067edb_hand_Sanitizer_1.jpg'
  },
  {
    name: 'Hand Soaps',
    slug: 'hand-soaps',
    description: 'Experience the strength of D2 Sanitizers\' industrial hand soaps. Tough on grime yet gentle on skin.',
    url: 'https://www.d2sanitizers.com/industrial-hand-soap',
    image: 'https://cdn.prod.website-files.com/639cc74f84d8d4077f6a25a1/66d87702bf9df164ffba3a20_commercial_hand_soap_10.jpg'
  },
  {
    name: 'Floor Sanitizers for Food Service',
    slug: 'floor-sanitizers',
    description: 'Find top-quality floor sanitizers for food service businesses. Keep your workspace clean and safe with our professional-grade products.',
    url: 'https://www.d2sanitizers.com/floor-sanitizers',
    image: 'https://cdn.prod.website-files.com/671129b3a7365cecb0df175c/6713b91ae8c615ff106102d0_BSX100-D-scaled.jpg'
  },
  {
    name: 'Food Safe Disinfectant Wipes',
    slug: 'disinfectant-wipes',
    description: 'Powerful disinfectant wipes designed for food processing facilities. Eliminate pathogens on surfaces to maintain hygiene and safety compliance.',
    url: 'https://www.d2sanitizers.com/disinfectant-wipes',
    image: 'https://cdn.prod.website-files.com/639cc74f84d8d4077f6a25a1/66e06febede411dc1ae5dffd_D2-Wipes_1280x.png'
  },
  {
    name: 'Dispensing Options',
    slug: 'dispensers',
    description: 'Explore high-quality sanitizing dispensers at D2 Sanitizers, designed for efficient and hygienic distribution in food service, industrial, and commercial settings.',
    url: 'https://www.d2sanitizers.com/dispensers',
    image: 'https://cdn.prod.website-files.com/671129b3a7365cecb0df175c/6713adbf9ba04f04d7ddbbc3_VC-Touchless-Disp-Pair-1024.jpg'
  },
  {
    name: 'Peracetic Acid Products',
    slug: 'peracetic-acid',
    description: 'Discover D2 Sanitizers\' peracetic acid solutions for eco-friendly disinfection across industries. Safe, effective, and ideal for agriculture, food, healthcare, and more.',
    url: 'https://www.d2sanitizers.com/peracetic-acid',
    image: 'https://cdn.prod.website-files.com/671129b3a7365cecb0df175c/6713a13c300a1099643c7312_Alpet-PAA-5.6-Group-1024.jpg'
  }
];

// Save files
fs.mkdirSync('./src/data', { recursive: true });

fs.writeFileSync('./src/data/categories.json', JSON.stringify(mainCategories, null, 2));
console.log('\nCategories saved to ./src/data/categories.json');

fs.writeFileSync('./src/data/products.json', JSON.stringify(uniqueProducts, null, 2));
console.log(`Products saved to ./src/data/products.json`);

console.log('\n=== SUMMARY ===');
console.log(`Total categories: ${mainCategories.length}`);
console.log(`Total products: ${uniqueProducts.length}`);
console.log('\nProducts per category:');
Object.entries(countByCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} products`);
});