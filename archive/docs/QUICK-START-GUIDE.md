# D2 Sanitizers - Quick Start Guide 🚀

## Current Status ✅

Your site is ready with:
- ✅ All static pages (About, Contact, Resources, Privacy, Terms)
- ✅ 7 Category pages (Hand Sanitizers, Surface Sanitizers, etc.)
- ✅ 6 Industry pages
- ✅ Blog templates with Sanity integration
- ✅ Product templates with Sanity integration
- ✅ Admin checklist page at `/admin`
- ✅ Image crawler and Cloudinary upload scripts ready

## Next Steps - In Order

### 1. Crawl & Upload Images (30 mins)

```bash
# Step 1: Run Apify Crawler
# Go to: https://console.apify.com/
# Create Web Scraper, paste code from apify-image-crawler.js
# Start URL: https://www.d2sanitizers.com
# Enable "Crawl all pages"
# Export results as d2-images-crawl.json

# Step 2: Add Cloudinary credentials to .env
CLOUDINARY_CLOUD_NAME=southland-organics
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Step 3: Upload images
npm run upload-images

# Result: d2-image-mapping.json will show all uploaded images
```

**See detailed instructions:** `APIFY-CLOUDINARY-INSTRUCTIONS.md`

### 2. Review Pages (1-2 hours)

```bash
# Visit the admin page
http://localhost:4322/admin

# Check off pages as you review them
# Leave notes for any changes needed
# Export notes when done
```

### 3. Configure Sanity CMS (30 mins)

```bash
# Update .env with your Sanity project ID
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production

# Add FAQ schema to Sanity Studio
# (Use code from sanity-schema-faq.js)
```

### 4. Add Product Content (1-2 hours)

Option A: **Use Sanity Studio**
- Add products through Sanity interface
- Products automatically appear on site

Option B: **Update product templates**
- Edit `/src/pages/product/[slug].astro`
- Add product data from your inventory

### 5. Update Images on Pages (1 hour)

Use `d2-image-mapping.json` to find correct Cloudinary IDs:

```astro
<!-- Replace placeholders like this -->
<CloudinaryImage
  publicId="d2-sanitizers/products/alpet-d2-surface-sanitizer"
  alt="Alpet D2 Surface Sanitizer"
  width={800}
  height={800}
/>
```

### 6. Test Everything (1 hour)

- [ ] All pages load correctly
- [ ] Images display properly
- [ ] Links work
- [ ] Mobile responsive
- [ ] Forms submit (contact page)
- [ ] FAQ accordion works
- [ ] Navigation menu works

### 7. Deploy (30 mins)

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify/etc
# (Follow your hosting provider's instructions)
```

## Key Files & Locations

| File/Folder | Purpose |
|------------|---------|
| `/admin` | Review checklist with notes |
| `/src/pages/` | All page templates |
| `/src/components/` | Reusable components |
| `/src/lib/sanity.ts` | Sanity CMS configuration |
| `apify-image-crawler.js` | Image crawler code for Apify |
| `scripts/upload-to-cloudinary.js` | Upload script |
| `d2-image-mapping.json` | Image URL mappings (created after upload) |
| `APIFY-CLOUDINARY-INSTRUCTIONS.md` | Detailed crawl instructions |

## Important URLs

- **Dev Server:** http://localhost:4322
- **Admin Page:** http://localhost:4322/admin
- **Apify Console:** https://console.apify.com/
- **Cloudinary Console:** https://cloudinary.com/console
- **Current Live Site:** https://www.d2sanitizers.com

## Quick Commands

```bash
# Start dev server
npm run dev

# Upload images to Cloudinary
npm run upload-images

# Build for production
npm run build

# Preview production build
npm run preview
```

## Color Palette

- **Primary Blue:** `#0071BB`
- **Navy:** `#0A2540`
- **Cyan:** `#00A9E0`
- **Light Blue:** `#E6F4FA`

## Fonts

- **Headings:** Revolution Gothic Bold (700)
- **Body:** Neuzeit Grotesk (400)

## Cloudinary Folder Structure

```
southland-organics/d2-sanitizers/
├── homepage/          # Hero images, features
├── products/          # Product photos
├── categories/        # Category hero images
├── blog/             # Blog featured images
├── industries/       # Industry page images
├── about/            # About page images
├── trust/            # Trust badges, certifications
└── general/          # Misc images
```

## Need Help?

1. **Images not uploading?**
   - Check `.env` for Cloudinary credentials
   - Verify `d2-images-crawl.json` exists
   - Check console for error messages

2. **Pages not loading?**
   - Make sure dev server is running: `npm run dev`
   - Check browser console for errors
   - Clear browser cache

3. **Sanity not working?**
   - Verify `PUBLIC_SANITY_PROJECT_ID` in `.env`
   - Check Sanity Studio is set up
   - Add FAQ schema to Studio

4. **Need to make changes?**
   - Pages: `/src/pages/`
   - Components: `/src/components/`
   - Styles: Tailwind classes inline
   - Colors: Update in component classes

## Current Phase: Image Migration

**You are here:** 👉 Ready to crawl and upload images

**Next:** Review pages on admin checklist

**After that:** Configure Sanity and add content

---

**Questions?** Check `APIFY-CLOUDINARY-INSTRUCTIONS.md` for detailed steps.