# D2 Sanitizers Website Crawl Analysis - Complete Package

## Overview
This package contains a comprehensive analysis of the D2 Sanitizers website (www.d2sanitizers.com) extracted from an Apify website crawl. All data has been processed and organized to facilitate building Astro pages for the website.

## Files Included

### 1. Source Data
- **`d2-apify-crawl.json`** (1.4 MB)
  - Original Apify crawl data
  - 208 total entries (153 pages + 55 PDFs)
  - Contains full HTML, markdown, metadata, and screenshots for each page

### 2. Processed Analysis Files
- **`d2-analysis.json`** (262 KB)
  - Structured analysis of all pages
  - Categorized by page type (product, blog, category, team, FAQ, static)
  - Extracted metadata, images, and content structure

- **`d2-astro-structure.json`** (369 KB)
  - Data optimized for Astro implementation
  - Includes page type definitions and example pages
  - Content structure templates
  - Complete image inventory

### 3. Documentation Files
- **`D2_ASTRO_BUILD_GUIDE.md`** (11 KB)
  - **PRIMARY REFERENCE DOCUMENT**
  - Complete guide for building Astro pages
  - TypeScript interfaces for each page type
  - URL structure and routing patterns
  - Schema.org markup examples
  - Recommended file structure
  - Implementation guidelines

- **`D2_WEBSITE_ANALYSIS_SUMMARY.txt`** (16 KB)
  - Detailed listings of all pages by type
  - Content structure breakdown
  - Page categorization

- **`D2_IMAGES_BY_PAGE.txt`** (27 KB)
  - Complete image inventory
  - Images organized by page
  - Direct CDN URLs for all 108 unique images

## Website Structure Summary

### Page Counts
- **Product Pages:** 30
- **Blog Posts:** 7
- **Category/Collection Pages:** 10
- **Team Member Pages:** 5
- **FAQ Pages:** 94
- **Static Pages:** 7
- **Total Pages:** 153
- **PDF Documents:** 55

### Page Types Identified

#### 1. Product Pages (30)
Individual product detail pages with:
- Product images and descriptions
- Technical specifications
- Supporting documentation (PDFs)
- Purchase functionality
- Schema.org Product markup

**Examples:**
- Alpet D2 Surface Sanitizer Spray
- Alpet E3 Hand Sanitizer Spray
- VersaClenz Touchless Hand Hygiene Dispenser
- DEMA PRO-FILL 2 Sink Dispenser

#### 2. Blog Posts (7)
Educational articles about sanitization:
- Featured images
- Author profiles (primarily Mike Usry)
- Rich content with headings
- Related products and posts

**Examples:**
- "Foaming Drain Cleaner Solutions for Industrial Applications"
- "Online HACCP Certification: Achieve Your Goals Today"
- "The Science Behind Surface Sanitizing: Why Contact Time Matters"

#### 3. Category/Collection Pages (10)
Product category listings:
- Hero images and banners
- Product grids
- Educational content
- Best practices information

**Categories:**
- Hand Sanitizers
- Surface Sanitizers
- Floor Sanitizers
- Dispensers
- Peracetic Acid
- Industrial Hand Soap
- Disinfectant Wipes
- Shoe Sanitizer
- Sanitizer Bundles

#### 4. Team Member Pages (5)
Individual profiles for team members:
- Professional headshots
- Job titles and bios
- Related blog posts
- Schema.org Person markup

**Team:**
- Mike Usry (Founder)
- Karin Usry
- Brad Broxton (VP Business Development)
- Erin Flowers (Copywriter/Editor)
- Allen Reynolds (Operations)

#### 5. FAQ Pages (94)
Individual Q&A pages covering:
- Product usage
- Safety information
- Technical specifications
- Comparison questions

#### 6. Static Pages (7)
- About page (company story)
- Shopping cart
- Resources
- Privacy policy
- Terms of service
- Account pages (login, user)

## Image Assets

### Total Images: 108 unique image URLs

### Image Categories:
- **Product Images:** Hero shots for each product (900x900 to 1500x1500px)
- **Blog Featured Images:** 1-4 per post
- **Team Photos:** Professional headshots
- **Category Banners:** 3-6 per category page
- **In-content Images:** Educational and lifestyle photos

### Hosting:
All images hosted on Webflow CDN: `cdn.prod.website-files.com`

## URL Structure

```
/product/[slug]                    - Product pages (30)
/blog/[slug]                       - Blog posts (7)
/[category-slug]                   - Category pages (10)
/team/[slug]                       - Team pages (5)
/faqs/[slug]                       - FAQ pages (94)
/about                             - About page
/cart                              - Shopping cart
/resources                         - Resources
/privacy-policy                    - Privacy
/terms-of-service                  - Terms
/account/login                     - Login
/account/user                      - User account
```

## Company Information

**D2 Sanitizers**
- **Founded:** 2020 (COVID-19 response)
- **Location:** 189 Luke Road, Bogart, GA 30622
- **Phone:** +1 (762) 255-8353
- **Sister Company:** Southland Organics
- **Focus:** Premium sanitizers, disinfectants, and cleaning solutions for food service, industrial, and healthcare markets

### Social Media:
- Facebook: https://www.facebook.com/profile.php?id=61565981982028
- Instagram: https://www.instagram.com/d2santizers
- Twitter/X: https://x.com/D2Sanitizers
- LinkedIn: linkedin.com/company/89937129

## How to Use This Data

### For Astro Development:

1. **Start with:** `D2_ASTRO_BUILD_GUIDE.md`
   - Contains all TypeScript interfaces
   - Recommended file structure
   - Implementation patterns

2. **Reference:** `d2-astro-structure.json`
   - Pre-structured data for Astro collections
   - Example pages for each type
   - Complete content structure

3. **Images:** `D2_IMAGES_BY_PAGE.txt`
   - Quick reference for image URLs
   - Organized by page for easy lookup

4. **Detailed Content:** `d2-apify-crawl.json`
   - Full HTML and markdown for each page
   - Complete metadata
   - Links to screenshots

## Recommended Astro Setup

```typescript
// Define collections for:
- products (30 items)
- blog (7 items)
- team (5 items)
- faqs (94 items)

// Create dynamic routes for:
- /product/[slug].astro
- /blog/[slug].astro
- /team/[slug].astro
- /faqs/[slug].astro
- /[category].astro (10 categories)
```

## Key Features to Implement

### E-commerce:
- Product listings with images
- Shopping cart functionality
- Add to cart buttons
- Discount codes
- Secure checkout (SSL + Cloudflare)
- User accounts and order history

### Content:
- Blog system with author profiles
- FAQ search and filtering
- Resource library with PDF downloads
- Team member showcase

### SEO:
- Canonical URLs
- Open Graph tags
- Twitter Cards
- Schema.org markup (Organization, Product, Person)
- Meta descriptions on all pages

## Notes

- All content is currently hosted on Webflow
- Strong emphasis on food safety and industrial applications
- Company founded during COVID-19 pandemic
- Focus on sustainable, natural sanitization solutions
- Extensive product documentation (55 PDFs)
- Well-structured FAQ system covering common questions

## Quick Stats

```
Total Pages Analyzed:     153
Product Inventory:        30 products
Blog Posts:              7 articles
Team Members:            5 profiles
FAQ Questions:           94 Q&As
Category Pages:          10 collections
Unique Images:           108 assets
PDF Documents:           55 files
```

---

**Generated:** September 30, 2025
**Source:** Apify website crawl of www.d2sanitizers.com
**Analysis Tool:** Claude Code with Python processing