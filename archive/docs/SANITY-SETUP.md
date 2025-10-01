# Sanity CMS Setup for D2 Sanitizers

## Overview
Sanity CMS has been installed and configured for managing:
- **Products** - Product listings with Cloudinary images
- **Blog Posts** - Blog content with related products
- **Categories** - Product categories
- **FAQs** - Frequently asked questions
- **Industries** - Industry-specific content

## Installation Complete ✅

The following packages have been installed:
- `@sanity/client` - Client for querying Sanity
- `@sanity/image-url` - Image URL builder
- `sanity` - Sanity Studio

## Project Structure

```
D2/
├── studio/
│   ├── sanity.config.ts       # Studio configuration
│   ├── sanity.cli.ts          # CLI configuration
│   └── schemas/
│       ├── index.ts           # Schema exports
│       ├── product.ts         # Product schema
│       ├── category.ts        # Category schema
│       ├── blogPost.ts        # Blog post schema
│       ├── faq.ts             # FAQ schema
│       └── industry.ts        # Industry schema
└── src/
    └── lib/
        └── sanity.ts          # Sanity client & helpers
```

## Next Steps

### 1. Create a Sanity Project

Visit https://www.sanity.io/manage and:
1. Sign in or create an account
2. Click "Create new project"
3. Name it "D2 Sanitizers"
4. Choose the free plan
5. Copy your **Project ID**

### 2. Update Environment Variables

Add these to your `.env` file:

```env
PUBLIC_SANITY_PROJECT_ID=your-project-id-here
PUBLIC_SANITY_DATASET=production
```

### 3. Update Sanity Configuration

Update both config files with your project ID:
- `studio/sanity.config.ts`
- `studio/sanity.cli.ts`

Replace `'your-project-id'` with your actual project ID.

### 4. Deploy the Studio

Run the following command to deploy your Sanity Studio:

```bash
npm run sanity:deploy
```

This will deploy your studio to: `https://your-project-name.sanity.studio`

### 5. Start Adding Content

You can manage content in two ways:

**Option 1: Via Sanity.studio (Recommended)**
- Visit `https://your-project-name.sanity.studio`
- Sign in with your Sanity account
- Start adding products, blog posts, FAQs, etc.

**Option 2: Run Studio Locally**
```bash
npm run sanity
```
- Studio will open at `http://localhost:3333`

## Schema Overview

### Product Schema
- Title, slug, description
- Cloudinary image public ID
- Category reference
- Price
- Features array
- Best suited for array
- Supporting documents (PDFs, SDS sheets, etc.)
- Featured flag

### Category Schema
- Name, slug, description
- Hero image (Cloudinary public ID)

### Blog Post Schema
- Title, slug, excerpt, body
- Author info (name, Cloudinary image ID)
- Featured image (Cloudinary public ID)
- Categories (references)
- Related products (references)
- Published date

### FAQ Schema
- Question, answer
- Category (dropdown: products, ordering, compliance, usage, general)
- Display order

### Industry Schema
- Name, slug, icon, description
- Full description (rich text)
- Challenges & solutions arrays
- Related products (references)

## Helper Functions Available

In `src/lib/sanity.ts`:

### Products
- `getAllProducts()` - Get all products
- `getProductBySlug(slug)` - Get single product
- `getProductsByCategory(categorySlug)` - Get products by category

### Blog
- `getAllBlogPosts()` - Get all blog posts
- `getBlogPostBySlug(slug)` - Get single blog post

### FAQs
- `getFAQs()` - Get all FAQs
- `getFAQsByCategory(category)` - Get FAQs by category

### Industries
- `getAllIndustries()` - Get all industries
- `getIndustryBySlug(slug)` - Get single industry

### Categories
- `getAllCategories()` - Get all categories

## Example: Using Sanity in an Astro Page

```astro
---
import { getProductsByCategory } from '../lib/sanity';
import CloudinaryImage from '../components/CloudinaryImage.astro';

const products = await getProductsByCategory('hand-sanitizers');
---

<div class="grid grid-cols-3 gap-6">
  {products.map((product) => (
    <div class="product-card">
      <CloudinaryImage
        publicId={`d2-sanitizers/products/${product.cloudinaryImage}`}
        alt={product.title}
        width={400}
        height={400}
      />
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <span>{product.price}</span>
    </div>
  ))}
</div>
```

## Cloudinary Integration

All images are stored in Cloudinary and referenced by their public ID in Sanity. This provides:
- Automatic optimization
- Responsive images
- Fast CDN delivery
- Easy transformations

When adding images in Sanity:
1. Upload image to Cloudinary first
2. Copy the public ID (e.g., `d2-sanitizers/products/alpet-e3-spray`)
3. Paste it into the Sanity field

## Current Image Mapping

A complete mapping of uploaded images is available in:
- `d2-image-mapping.json` - All uploaded images with Cloudinary public IDs
- `d2-page-updates.json` - Images organized by page

## Scripts

```bash
# Start Sanity Studio locally
npm run sanity

# Deploy Sanity Studio
npm run sanity:deploy

# Start Astro dev server
npm run dev

# Build Astro site
npm run build
```

## Troubleshooting

### "Project ID not found"
Make sure you've:
1. Created a project on sanity.io/manage
2. Added `PUBLIC_SANITY_PROJECT_ID` to `.env`
3. Updated both config files

### "Dataset not found"
The dataset is created automatically on first deployment. If you see this error:
```bash
cd studio && sanity dataset create production
```

### Images not loading
1. Verify Cloudinary public IDs in Sanity match uploaded images
2. Check `d2-image-mapping.json` for correct public IDs
3. Ensure CloudinaryImage component is used correctly

## Support

- Sanity Documentation: https://www.sanity.io/docs
- Sanity Community: https://slack.sanity.io/
- D2 Dev Server: http://localhost:4322/