# D2 Sanitizers - Astro Website Build Guide

## Overview
This document provides a comprehensive analysis of the D2 Sanitizers website crawl data, organized to facilitate building Astro pages.

**Total Pages Analyzed:** 153 pages (excluding 55 PDF documents)

## Site Structure Summary

### Page Type Breakdown
- **Product Pages:** 30
- **Blog Posts:** 7
- **Category/Collection Pages:** 10
- **Team Member Pages:** 5
- **FAQ Pages:** 94
- **Static Pages:** 7

---

## Content Structure Templates

### 1. Product Page Template

**Required Components:**
```typescript
interface ProductPage {
  title: string;                    // Product name (H1)
  slug: string;                     // URL slug from /product/[slug]
  description: string;              // Meta description & intro text
  images: string[];                 // Product images
  price: number | string;           // Price information
  features: string[];               // Product features/benefits
  bestSuitedFor: string[];         // Target use cases
  dispensingOptions?: string[];    // Variations/options
  technicalSpecs: object;          // Technical specifications
  supportingDocs: Document[];      // PDFs (SDS, tech sheets, etc.)
  relatedProducts: Product[];      // Related product links
  schema: ProductSchema;           // Schema.org markup
}
```

**Common Sections:**
1. Hero section with product image and title
2. Product description and benefits
3. "Best Suited for" section
4. Dispensing options/variations
5. Technical specifications
6. Supporting documents (PDFs)
7. Related products carousel
8. Add to cart/purchase functionality

**Example Products:**
- Alpet D2 Surface Sanitizer Spray
- Alpet E3 Hand Sanitizer Spray
- VersaClenz Touchless Hand Hygiene Dispenser
- DEMA PRO-FILL 2 Sink Dispenser

---

### 2. Blog Post Template

**Required Components:**
```typescript
interface BlogPost {
  title: string;                // Article title (H1)
  slug: string;                 // URL slug from /blog/[slug]
  description: string;          // Meta description
  featuredImage: string;        // Hero image
  author: {
    name: string;
    photo: string;
    bio: string;
  };
  publishDate: string;
  content: string;              // Markdown content
  headings: string[];           // H2/H3 structure
  relatedPosts: BlogPost[];
  relatedProducts: Product[];
}
```

**Common Sections:**
1. Featured image
2. Title and author info
3. Article content with proper heading hierarchy
4. Images within content
5. Call-to-action sections
6. Related products/articles
7. Author bio at bottom

**Example Blog Posts:**
- "Foaming Drain Cleaner Solutions for Industrial Applications"
- "Online HACCP Certification: Achieve Your Goals Today"
- "The Science Behind Surface Sanitizing: Why Contact Time Matters"

---

### 3. Category/Collection Page Template

**Required Components:**
```typescript
interface CategoryPage {
  title: string;                // Category name (H1)
  slug: string;                 // URL slug
  description: string;          // Category description
  heroImages: string[];         // Banner/hero images
  products: Product[];          // Product listings
  educationalContent: string;   // Educational sections
  bestPractices: string;        // Best practices info
  relatedFAQs: FAQ[];          // Related FAQ items
}
```

**Common Sections:**
1. Hero/banner section
2. Category description
3. Product grid with cards
4. Educational content sections
5. Best practices information
6. Related FAQ sections
7. Call-to-action

**Example Categories:**
- Hand Sanitizers
- Surface Sanitizers
- Floor Sanitizers
- Dispensers
- Peracetic Acid
- Industrial Hand Soap
- Disinfectant Wipes
- Shoe Sanitizer
- Sanitizer Bundles

---

### 4. Team Member Page Template

**Required Components:**
```typescript
interface TeamMember {
  name: string;                 // Full name (H1)
  slug: string;                 // URL slug from /team/[slug]
  photo: string;                // Professional headshot
  title: string;                // Job title/role
  bio: string;                  // Biography
  background: string;           // Professional background
  interests?: string;           // Personal interests
  relatedPosts?: BlogPost[];   // Blog posts by this person
  schema: PersonSchema;         // Schema.org markup
}
```

**Team Members:**
1. Mike Usry - Founder/Entrepreneur
2. Karin Usry
3. Brad Broxton - VP of Business Development
4. Erin Flowers - Copywriter and Editor
5. Allen Reynolds - Operations

---

### 5. Static Page Templates

**About Page:**
- Company story and mission
- COVID-19 origin story
- Core values
- Commitment to sustainability
- Team section (links to team pages)

**Cart Page:**
- Shopping cart functionality
- Cart items display
- Discount codes
- Checkout button
- Security badges (SSL, Cloudflare)

**Resources Page:**
- Product guides
- Safety data sheets
- Best practices documentation
- Educational materials

**FAQ Pages:**
- 94 individual FAQ pages
- Organized by topic
- Question as H1
- Detailed answer content
- Related products/links

---

## Image Assets

### Image URLs by Category

**Product Images:** Each product has 1 main hero image
- Format: `.jpeg`, `.png`
- Hosted on: `cdn.prod.website-files.com`
- Typical size: 900x900 to 1500x1500

**Blog Post Images:**
- Featured images: 1-4 per post
- In-content images
- Author photos

**Team Photos:**
- Professional headshots
- Consistent styling

**Category Page Images:**
- Hero banners: 3-6 images per category
- Product thumbnails
- Lifestyle/application photos

**Total Unique Images:** 108

---

## URL Structure

### Product Pages
```
/product/[slug]
```
Examples:
- `/product/alpet-d2-surface-sanitizer`
- `/product/versaclenz-touchless-hand-hygiene-dispenser`
- `/product/foot-operated-hand-sanitizer-dispenser`

### Blog Posts
```
/blog/[slug]
```
Examples:
- `/blog/foaming-drain-cleaner-solutions-for-industrial-applications`
- `/blog/online-haccp-certification-achieve-your-goals-today`
- `/blog/commercial-disinfectants-guide`

### Category Pages
```
/[category-slug]
```
Examples:
- `/hand-sanitizers`
- `/surface-sanitizers`
- `/floor-sanitizers`
- `/dispensers`
- `/peracetic-acid`
- `/industrial-hand-soap`
- `/disinfectant-wipes`
- `/shoe-sanitizer`
- `/sanitizer-bundles`

### Team Pages
```
/team/[slug]
```
Examples:
- `/team/mike-usry`
- `/team/brad-broxton`
- `/team/erin-flowers`

### Static Pages
```
/about
/cart
/resources
/faqs
/privacy-policy
/terms-of-service
/account/login
/account/user
```

---

## Schema.org Markup

### Organization Schema (Global)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "D2 Sanitizers",
  "url": "https://www.d2sanitizers.com",
  "logo": "https://www.d2sanitizers.com/images/logo.png",
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61565981982028",
    "https://www.instagram.com/d2santizers",
    "https://x.com/D2Sanitizers",
    "linkedin.com/company/89937129"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+7622558353",
    "contactType": "Customer Support",
    "areaServed": "US",
    "availableLanguage": "English"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "189 Luke Road",
    "addressLocality": "Bogart",
    "addressRegion": "GA",
    "postalCode": "30622",
    "addressCountry": "US"
  },
  "foundingDate": "2020",
  "founders": [{
    "@type": "Person",
    "name": "Mike Usry"
  }],
  "description": "D2 Sanitizers provides premium foam drain cleaning equipment, sanitizers, and disinfectants for commercial and industrial applications."
}
```

### Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "image": "product-image-url",
  "description": "Product description",
  "brand": {
    "@type": "Brand",
    "name": "D2 Sanitizers"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "price": "0.00",
    "priceCurrency": "USD"
  }
}
```

### Person Schema (Team Pages)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Team Member Name",
  "jobTitle": "Job Title",
  "worksFor": {
    "@type": "Organization",
    "name": "D2 Sanitizers"
  }
}
```

---

## Key Features & Functionality

### E-commerce Features
- Product listings with images
- Shopping cart
- Add to cart functionality
- Discount codes
- Secure checkout (SSL + Cloudflare)
- Account login/registration
- Order history

### Content Management
- Blog system with author profiles
- FAQ system (94+ Q&A pairs)
- Resource library with PDF downloads
- Team member profiles

### SEO & Meta
- Canonical URLs on all pages
- Open Graph tags for social sharing
- Twitter Card tags
- Comprehensive meta descriptions
- Schema.org structured data

---

## Astro Implementation Recommendations

### File Structure
```
src/
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── cart.astro
│   ├── resources.astro
│   ├── product/
│   │   └── [slug].astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── team/
│   │   └── [slug].astro
│   ├── faqs/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── [category].astro
├── components/
│   ├── ProductCard.astro
│   ├── BlogCard.astro
│   ├── TeamCard.astro
│   ├── Header.astro
│   ├── Footer.astro
│   └── Schema.astro
├── layouts/
│   ├── BaseLayout.astro
│   ├── ProductLayout.astro
│   ├── BlogLayout.astro
│   └── CategoryLayout.astro
└── data/
    ├── products.json
    ├── blog-posts.json
    ├── team-members.json
    └── faqs.json
```

### Collections Setup
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    price: z.number().or(z.string()),
    features: z.array(z.string()),
    category: z.string(),
  }),
});

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    publishDate: z.date(),
    featuredImage: z.string(),
  }),
});

const team = defineCollection({
  schema: z.object({
    name: z.string(),
    title: z.string(),
    photo: z.string(),
    bio: z.string(),
  }),
});

export const collections = { products, blog, team };
```

---

## Additional Resources

All extracted data is available in:
- `d2-apify-crawl.json` - Full crawl data
- `d2-analysis.json` - Processed analysis
- `d2-astro-structure.json` - Structured for Astro
- `D2_WEBSITE_ANALYSIS_SUMMARY.txt` - Text summary
- `D2_IMAGES_BY_PAGE.txt` - Image reference guide

---

## Notes

1. All images are hosted on Webflow CDN (`cdn.prod.website-files.com`)
2. 55 PDF documents for product support materials
3. E-commerce powered by Webflow/custom solution
4. Strong focus on food service, industrial, and healthcare markets
5. Sister company to Southland Organics
6. Founded in 2020 in response to COVID-19
7. Based in Bogart, GA

