# D2 Sanitizers - Quick Reference Guide

## Start Here

1. **Main Guide:** `D2_ASTRO_BUILD_GUIDE.md` - Complete implementation guide
2. **Overview:** `README_ANALYSIS.md` - This package documentation
3. **Source Data:** `d2-apify-crawl.json` - Original crawl data

## Page Type Breakdown

| Type | Count | URL Pattern | Example |
|------|-------|-------------|---------|
| Products | 30 | `/product/[slug]` | `/product/alpet-d2-surface-sanitizer` |
| Blog Posts | 7 | `/blog/[slug]` | `/blog/commercial-disinfectants-guide` |
| Categories | 10 | `/[category-slug]` | `/hand-sanitizers` |
| Team | 5 | `/team/[slug]` | `/team/mike-usry` |
| FAQs | 94 | `/faqs/[slug]` | `/faqs/what-is-a-quat` |
| Static | 7 | Various | `/about`, `/cart`, `/resources` |

## Categories List

1. `/hand-sanitizers` - Hand Sanitizer Products
2. `/surface-sanitizers` - Surface Sanitizers Collection
3. `/floor-sanitizers` - Floor Sanitizers for Food Service
4. `/dispensers` - Advanced Chemical Dispenser System
5. `/peracetic-acid` - Peracetic Acid Sanitizer
6. `/industrial-hand-soap` - Industrial Hand Soap
7. `/disinfectant-wipes` - Food Safe Wipes
8. `/shoe-sanitizer` - Shoe & Boot Sanitizing Stations
9. `/sanitizer-bundles` - Sanitizer Bundles
10. `/blog` - Blog listing page

## Top Products (by category)

### Hand Sanitizers
- Alpet E3 Hand Sanitizer Spray
- Alpet E3 Plus Hand Sanitizer Spray

### Surface Sanitizers
- Alpet D2 Surface Sanitizer Spray
- Alpet D2 Surface Sanitizing Wipes
- Alpet D2 Quat-Free Surface Sanitizer
- Alpet No-Rinse Quat Sanitizer

### Dispensers
- VersaClenz Touchless Hand Hygiene Dispenser
- VersaClenz Manual Hand Hygiene Dispenser
- EZ Step Wall-Mounted Foot-Activated Dispenser
- EZ Step Portable Foot-Activated Dispenser
- DEMA PRO-FILL 2 Sink Dispenser

### Industrial Soaps
- Alpet E2 Sanitizing Foam Soap
- Alpet Q E2 Sanitizing Foam Soap
- HACCP Q E2 Sanitizing Liquid Soap
- Alpet E1 Fragrance-Free Foam Soap
- SoftenSure Foam Soap
- Alpet E4 Industrial Hand Cleaner

### Peracetic Acid
- Alpet PAA 15% Antimicrobial Solution
- Alpet PAA 5.6% Antimicrobial Solution
- Alpet PERA FC 15% Antimicrobial Solution
- Alpet PERA FC 22% Antimicrobial Solution

### Bundles
- D2 Sanitizers Bundle
- D2 Sanitizers Bundle Plus
- D2 Sanitizers Hand Sanitizer Bundle

### Equipment
- Foamers (Pump-Up)
- Drain Foaming Attachment
- Trench Drain Foaming Attachment
- Airless SmartStep Footwear Sanitizing System
- Dry Step Bicarb Granulated Floor Treatment
- BSI-275 Concentrated Liquid Warewashing Detergent

## Blog Posts

1. "Foaming Drain Cleaner Solutions for Industrial Applications"
2. "Online HACCP Certification: Achieve Your Goals Today"
3. "Peracetic Acid Suppliers: D2 Sanitizers"
4. "Sanitizer for 3 Compartment Sink"
5. "You Can Prevent Foodborne Illness by Sanitizing Your Kitchen Properly"
6. "The Science Behind Surface Sanitizing: Why Contact Time Matters"
7. "In-Depth Guide To Commercial Disinfectants"

## Team Members

1. **Mike Usry** - Founder/Entrepreneur
   - `/team/mike-usry`
   - Photo: `6711349793ce937952f2f20a_mike_usry.jpg`

2. **Karin Usry**
   - `/team/karin-usry`
   - Photo: `6711348e7277163f129a1b53_karin_usry.jpg`

3. **Brad Broxton** - VP of Business Development
   - `/team/brad-broxton`
   - Photo: `672e068053e247c18b9dedb3_Brad_Broxton_zwz9dj.jpg`

4. **Erin Flowers** - Copywriter and Editor
   - `/team/erin-flowers`
   - Photo: `6711348651504ebf147d887d_erin_flowers.jpg`

5. **Allen Reynolds** - Operations
   - `/team/allen-reynolds`
   - Photo: `672e05639bb67074f6f4d386_Allen_Reynolds.jpg`

## Common Image Patterns

### Product Images
```
Pattern: [product-name]-[variant]-[size].jpeg/png
Size: 900x900 to 1500x1500px
Example: alpet_d2_surface_sanitizer_case.png
```

### Blog Featured Images
```
Pattern: [descriptive-name].jpg/jpeg
Example: haccp-certification.jpg
Example: man-working-in-a-brewery-cleaning-floor.jpg
```

### Team Photos
```
Pattern: [firstname]_[lastname].jpg
Example: mike_usry.jpg
Example: erin_flowers.jpg
```

## TypeScript Interfaces (Quick Reference)

```typescript
// Product
interface Product {
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number | string;
  category: string;
  features: string[];
  supportingDocs: PDF[];
}

// Blog Post
interface BlogPost {
  title: string;
  slug: string;
  description: string;
  featuredImage: string;
  author: string;
  publishDate: Date;
  content: string; // markdown
}

// Team Member
interface TeamMember {
  name: string;
  slug: string;
  title: string;
  photo: string;
  bio: string;
  relatedPosts?: string[];
}

// Category
interface Category {
  title: string;
  slug: string;
  description: string;
  heroImages: string[];
  products: Product[];
  educationalContent: string;
}

// FAQ
interface FAQ {
  question: string;
  slug: string;
  answer: string;
  relatedProducts?: Product[];
}
```

## Schema.org Quick Templates

### Global Organization (all pages)
```json
{
  "@type": "Organization",
  "name": "D2 Sanitizers",
  "url": "https://www.d2sanitizers.com",
  "telephone": "+7622558353",
  "address": {
    "streetAddress": "189 Luke Road",
    "addressLocality": "Bogart",
    "addressRegion": "GA",
    "postalCode": "30622"
  }
}
```

### Product Pages
```json
{
  "@type": "Product",
  "name": "Product Name",
  "image": "product-image-url",
  "brand": "D2 Sanitizers"
}
```

### Team Pages
```json
{
  "@type": "Person",
  "name": "Team Member Name",
  "jobTitle": "Job Title",
  "worksFor": "D2 Sanitizers"
}
```

## File Size Reference

```
d2-apify-crawl.json          1.4 MB  (source data)
d2-astro-structure.json      369 KB  (structured for Astro)
d2-analysis.json             262 KB  (processed analysis)
D2_IMAGES_BY_PAGE.txt         27 KB  (image reference)
D2_WEBSITE_ANALYSIS_SUMMARY   16 KB  (text summary)
D2_ASTRO_BUILD_GUIDE.md       11 KB  (main guide)
```

## Key URLs & CDN

**Website:** https://www.d2sanitizers.com
**CDN:** https://cdn.prod.website-files.com/
**Logo:** https://www.d2sanitizers.com/images/logo.png

## Essential Features to Implement

- [ ] Product catalog with 30 products
- [ ] Shopping cart functionality
- [ ] Blog with 7 posts
- [ ] Team page with 5 members
- [ ] FAQ system with 94 Q&As
- [ ] 10 category/collection pages
- [ ] E-commerce checkout
- [ ] User accounts
- [ ] Search functionality
- [ ] Mobile responsive design
- [ ] SEO optimization (meta tags, schema.org)
- [ ] PDF resource downloads (55 documents)

## Contact Information

**Company:** D2 Sanitizers
**Address:** 189 Luke Road, Bogart, GA 30622
**Phone:** (762) 255-8353
**Email:** (Contact form on website)

**Social Media:**
- Facebook: /profile.php?id=61565981982028
- Instagram: @d2santizers
- Twitter: @D2Sanitizers
- LinkedIn: /company/89937129

---

**Last Updated:** September 30, 2025
