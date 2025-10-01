import fs from 'fs';

// Load the crawled data
const data = JSON.parse(fs.readFileSync('./d2-apify-crawl.json', 'utf8'));

// Category mapping to the 6 main homepage categories
const categoryMapping = {
  'hand-sanitizers': 'Hand Sanitizers',
  'industrial-hand-soap': 'Hand Soaps',
  'floor-sanitizers': 'Floor Sanitizers for Food Service',
  'surface-sanitizers': 'Floor Sanitizers for Food Service', // Surface sanitizers often used on floors
  'disinfectant-wipes': 'Food Safe Disinfectant Wipes',
  'dispensers': 'Dispensing Options',
  'peracetic-acid': 'Peracetic Acid Products',
  'shoe-sanitizer': 'Floor Sanitizers for Food Service'
};

// Product-specific category overrides based on keywords
function getCategoryForProduct(productName, defaultCategory) {
  const nameLower = productName.toLowerCase();

  // Dispensing equipment
  if (nameLower.includes('dispenser') || nameLower.includes('foamer') ||
      nameLower.includes('foam unit') || nameLower.includes('versaclenz') ||
      nameLower.includes('ez step') || nameLower.includes('dema') ||
      nameLower.includes('attachment') && (nameLower.includes('drain') || nameLower.includes('foaming'))) {
    return 'Dispensing Options';
  }

  // Hand sanitizers
  if (nameLower.includes('hand sanitizer') || nameLower.includes('e3 plus') || nameLower.includes('alpet e3')) {
    return 'Hand Sanitizers';
  }

  // Hand soaps
  if (nameLower.includes('hand soap') || nameLower.includes('e2') || nameLower.includes('e1') ||
      nameLower.includes('e4') || nameLower.includes('softensure')) {
    return 'Hand Soaps';
  }

  // Wipes
  if (nameLower.includes('wipe')) {
    return 'Food Safe Disinfectant Wipes';
  }

  // Surface/Floor sanitizers
  if (nameLower.includes('surface sanitizer') || nameLower.includes('d2 quat') ||
      nameLower.includes('alpet d2') || nameLower.includes('no-rinse quat')) {
    return 'Floor Sanitizers for Food Service';
  }

  // Peracetic acid products
  if (nameLower.includes('peracetic') || nameLower.includes('paa') || nameLower.includes('alpet paa')) {
    return 'Peracetic Acid Products';
  }

  // Floor/Shoe sanitizers
  if (nameLower.includes('floor') || nameLower.includes('shoe') || nameLower.includes('boot') ||
      nameLower.includes('footwear') || nameLower.includes('smartstep') || nameLower.includes('dry step')) {
    return 'Floor Sanitizers for Food Service';
  }

  return defaultCategory;
}

// Category URLs
const categoryUrls = [
  'https://www.d2sanitizers.com/hand-sanitizers',
  'https://www.d2sanitizers.com/industrial-hand-soap',
  'https://www.d2sanitizers.com/floor-sanitizers',
  'https://www.d2sanitizers.com/surface-sanitizers',
  'https://www.d2sanitizers.com/disinfectant-wipes',
  'https://www.d2sanitizers.com/dispensers',
  'https://www.d2sanitizers.com/peracetic-acid',
  'https://www.d2sanitizers.com/shoe-sanitizer'
];

// Extract products from markdown
function extractProductsFromMarkdown(markdown, categorySlug) {
  const products = [];

  // Pattern 1: Products with prices - Format: ![Product Name](image-url)\n### Product Name\n$Price
  const productPatternWithPrice = /!\[([^\]]+)\]\(([^\)]+)\)\s*###\s*([^\n]+)\s*\$([0-9.,]+)/g;

  let match;
  while ((match = productPatternWithPrice.exec(markdown)) !== null) {
    const [fullMatch, altText, imageUrl, productName, price] = match;

    // Create slug from product name
    const slug = productName
      .toLowerCase()
      .replace(/[®™]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const defaultCategory = categoryMapping[categorySlug] || categorySlug;
    const finalCategory = getCategoryForProduct(productName.trim(), defaultCategory);

    products.push({
      name: productName.trim(),
      slug: slug,
      price: parseFloat(price.replace(/,/g, '')),
      image: imageUrl,
      category: finalCategory,
      categorySlug: categorySlug
    });
  }

  // Pattern 2: Products with links - Format: [![Product Name](image-url)](product-link)\n### Product Name
  const productPatternWithLink = /\[!\[([^\]]+)\]\(([^\)]+)\)\]\(([^\)]+)\)\s*###\s*([^\n$]+)/g;

  while ((match = productPatternWithLink.exec(markdown)) !== null) {
    const [fullMatch, altText, imageUrl, productLink, productName] = match;

    // Extract slug from product link
    const linkSlug = productLink.split('/').pop();

    const defaultCategory = categoryMapping[categorySlug] || categorySlug;
    const finalCategory = getCategoryForProduct(productName.trim(), defaultCategory);

    products.push({
      name: productName.trim(),
      slug: linkSlug,
      price: null, // No price available for these products
      image: imageUrl,
      productUrl: productLink,
      category: finalCategory,
      categorySlug: categorySlug
    });
  }

  // Pattern 3: Text-only product mentions (FAQs mention products like "Alpet E1", "Alpet E2", etc.)
  // Skip this for now to avoid incomplete product names
  // const productNames = extractProductNamesFromText(markdown, categorySlug);
  // productNames.forEach(name => {
  //   // Only add if not already in products list
  //   if (!products.find(p => p.name === name)) {
  //     const slug = name
  //       .toLowerCase()
  //       .replace(/[®™]/g, '')
  //       .replace(/[^\w\s-]/g, '')
  //       .replace(/\s+/g, '-')
  //       .replace(/-+/g, '-')
  //       .trim();

  //     const defaultCategory = categoryMapping[categorySlug] || categorySlug;
  //     const finalCategory = getCategoryForProduct(name, defaultCategory);

  //     products.push({
  //       name: name,
  //       slug: slug,
  //       price: null,
  //       image: '',
  //       category: finalCategory,
  //       categorySlug: categorySlug
  //     });
  //   }
  // });

  return products;
}

// Extract product names mentioned in text (for products without explicit listings)
function extractProductNamesFromText(markdown, categorySlug) {
  const productNames = new Set();

  // Common product patterns in FAQs and text
  const patterns = [
    /Alpet\s+[A-Z0-9]+(?:\s+[A-Za-z\s]+)?/g,
    /SoftenSure\s+[A-Za-z\s]+/g,
    /VersaClenz\s+[A-Za-z\s]+/g,
    /Smart-San\s+[A-Za-z\s-]+/g,
    /Dry Step\s+[A-Za-z\s]+/g,
    /EZ Step\s+[A-Za-z\s,\-]+/g,
    /DEMA\s+[A-Z\-0-9:]+/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      const name = match[0].trim();
      // Filter out generic mentions and keep specific product names
      if (name.length > 8 && !name.includes('FAQ')) {
        productNames.add(name);
      }
    }
  });

  return Array.from(productNames);
}

// Extract all products
const allProducts = [];
const categories = [];

categoryUrls.forEach(url => {
  const page = data.find(p => p.url === url);

  if (page && page.markdown) {
    const slug = url.split('/').pop();

    // Extract category info
    categories.push({
      name: categoryMapping[slug] || page.metadata.title.split('|')[0].trim(),
      slug: slug,
      description: page.metadata.description,
      url: url,
      image: extractCategoryImage(page.markdown)
    });

    // Extract products
    const products = extractProductsFromMarkdown(page.markdown, slug);
    allProducts.push(...products);

    console.log(`Found ${products.length} products in ${slug}`);
  }
});

function extractCategoryImage(markdown) {
  const imagePattern = /!\[[^\]]*\]\((https:\/\/cdn\.prod\.website-files\.com[^\)]+)\)/;
  const match = markdown.match(imagePattern);
  return match ? match[1] : '';
}

// Deduplicate products by name
const uniqueProducts = [];
const seenNames = new Set();

allProducts.forEach(product => {
  const normalizedName = product.name.toLowerCase().trim();

  if (!seenNames.has(normalizedName)) {
    seenNames.add(normalizedName);
    uniqueProducts.push(product);
  } else {
    // If duplicate, keep the one with more data (image, price, etc.)
    const existingIndex = uniqueProducts.findIndex(p => p.name.toLowerCase().trim() === normalizedName);
    const existing = uniqueProducts[existingIndex];

    // Replace if the new one has more data
    if ((product.image && !existing.image) ||
        (product.price && !existing.price) ||
        (product.productUrl && !existing.productUrl)) {
      uniqueProducts[existingIndex] = product;
    }
  }
});

console.log(`Deduplicated: ${allProducts.length} -> ${uniqueProducts.length} products`);

// Count products by category
const productsByCategory = {};
uniqueProducts.forEach(product => {
  const cat = product.category;
  productsByCategory[cat] = (productsByCategory[cat] || 0) + 1;
});

console.log('\nProduct count by category:');
console.log(JSON.stringify(productsByCategory, null, 2));

// Create unique categories list based on the 6 main categories
const mainCategories = [
  {
    name: 'Hand Sanitizers',
    slug: 'hand-sanitizers',
    description: 'Get your hands on the best hand sanitizer products from D2 Sanitizers. Stay germ-free with our effective sanitizing solutions.',
    url: 'https://www.d2sanitizers.com/hand-sanitizers',
    image: ''
  },
  {
    name: 'Hand Soaps',
    slug: 'hand-soaps',
    description: 'Experience the strength of D2 Sanitizers\' industrial hand soaps. Tough on grime yet gentle on skin.',
    url: 'https://www.d2sanitizers.com/industrial-hand-soap',
    image: ''
  },
  {
    name: 'Floor Sanitizers for Food Service',
    slug: 'floor-sanitizers',
    description: 'Find top-quality floor sanitizers for food service businesses. Keep your workspace clean and safe with our professional-grade products.',
    url: 'https://www.d2sanitizers.com/floor-sanitizers',
    image: ''
  },
  {
    name: 'Food Safe Disinfectant Wipes',
    slug: 'disinfectant-wipes',
    description: 'Powerful disinfectant wipes designed for food processing facilities. Eliminate pathogens on surfaces to maintain hygiene and safety compliance.',
    url: 'https://www.d2sanitizers.com/disinfectant-wipes',
    image: ''
  },
  {
    name: 'Dispensing Options',
    slug: 'dispensers',
    description: 'Explore high-quality sanitizing dispensers at D2 Sanitizers, designed for efficient and hygienic distribution in food service, industrial, and commercial settings.',
    url: 'https://www.d2sanitizers.com/dispensers',
    image: ''
  },
  {
    name: 'Peracetic Acid Products',
    slug: 'peracetic-acid',
    description: 'Discover D2 Sanitizers\' peracetic acid solutions for eco-friendly disinfection across industries. Safe, effective, and ideal for agriculture, food, healthcare, and more.',
    url: 'https://www.d2sanitizers.com/peracetic-acid',
    image: ''
  }
];

// Add images to main categories from parsed data
categories.forEach(cat => {
  const mainCat = mainCategories.find(mc => mc.slug === cat.slug || mc.name === categoryMapping[cat.slug]);
  if (mainCat && cat.image) {
    mainCat.image = cat.image;
  }
});

// Save categories to JSON
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/categories.json', JSON.stringify(mainCategories, null, 2));
console.log('\nCategories saved to ./src/data/categories.json');

// Save products to JSON
fs.writeFileSync('./src/data/products.json', JSON.stringify(uniqueProducts, null, 2));
console.log(`Products saved to ./src/data/products.json (${uniqueProducts.length} total products)`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Total categories: ${mainCategories.length}`);
console.log(`Total products: ${uniqueProducts.length}`);
console.log('\nProducts per category:');
Object.entries(productsByCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} products`);
});