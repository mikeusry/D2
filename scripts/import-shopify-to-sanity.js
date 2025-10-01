import Shopify from 'shopify-api-node';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Shopify client
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_NAME || 'd2sanitizers',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN
});

// Sanity client
const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '91lu7dju',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN, // You'll need to add this
  useCdn: false,
  apiVersion: '2024-01-01'
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImageToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'd2-sanitizers/products',
      overwrite: false
    });
    console.log(`✓ Uploaded image: ${publicId}`);
    return result.public_id;
  } catch (error) {
    console.error(`✗ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

async function createSanityCategory(categoryName) {
  const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Check if category already exists
  const existing = await sanityClient.fetch(
    `*[_type == "category" && slug.current == $slug][0]`,
    { slug }
  );

  if (existing) {
    console.log(`Category "${categoryName}" already exists`);
    return existing._id;
  }

  // Create new category
  const category = await sanityClient.create({
    _type: 'category',
    name: categoryName,
    slug: {
      _type: 'slug',
      current: slug
    },
    description: `${categoryName} products from D2 Sanitizers`
  });

  console.log(`✓ Created category: ${categoryName}`);
  return category._id;
}

async function importProducts() {
  console.log('Starting Shopify to Sanity import...\n');

  let products = [];
  let params = { limit: 250 };

  // Fetch all products
  console.log('Fetching products from Shopify...');
  do {
    const fetchedProducts = await shopify.product.list(params);
    products = products.concat(fetchedProducts);

    if (fetchedProducts.length < params.limit) break;

    params = fetchedProducts.nextPageParameters;
  } while (params !== undefined);

  console.log(`Found ${products.length} products\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      console.log(`\nProcessing: ${product.title}`);

      // Get or create category
      let categoryId = null;
      if (product.product_type) {
        categoryId = await createSanityCategory(product.product_type);
      }

      // Upload main image to Cloudinary
      let cloudinaryImageId = null;
      if (product.image && product.image.src) {
        const imagePublicId = `shopify_${product.id}_${product.handle}`;
        cloudinaryImageId = await uploadImageToCloudinary(product.image.src, imagePublicId);
      }

      // Get first variant for pricing
      const variant = product.variants[0];

      // Check if product already exists
      const existingProduct = await sanityClient.fetch(
        `*[_type == "product" && shopifyId == $shopifyId][0]`,
        { shopifyId: product.id.toString() }
      );

      const sanityProduct = {
        _type: 'product',
        title: product.title,
        slug: {
          _type: 'slug',
          current: product.handle
        },
        description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '') : '',
        shopifyId: product.id.toString(),
        sku: variant.sku || '',
        price: parseFloat(variant.price) || 0,
        cloudinaryImage: cloudinaryImageId,
        featured: false,
        inStock: variant.inventory_quantity > 0,
        inventoryQuantity: variant.inventory_quantity || 0,
        weight: variant.weight || 0,
        weightUnit: variant.weight_unit || 'lb'
      };

      // Add category reference if exists
      if (categoryId) {
        sanityProduct.category = {
          _type: 'reference',
          _ref: categoryId
        };
      }

      if (existingProduct) {
        // Update existing product
        await sanityClient.patch(existingProduct._id).set(sanityProduct).commit();
        console.log(`✓ Updated: ${product.title}`);
        skipped++;
      } else {
        // Create new product
        await sanityClient.create(sanityProduct);
        console.log(`✓ Created: ${product.title}`);
        imported++;
      }

    } catch (error) {
      console.error(`✗ Error importing ${product.title}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Import Complete!');
  console.log('='.repeat(50));
  console.log(`✓ Created: ${imported}`);
  console.log(`↻ Updated: ${skipped}`);
  console.log(`✗ Errors: ${errors}`);
  console.log(`Total: ${products.length}`);
}

// Run import
importProducts()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
