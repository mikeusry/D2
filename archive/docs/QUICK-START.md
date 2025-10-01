# D2 Sanitizers - Quick Start Guide

## 🚀 Your Site is Live!

### Access Your Tools:
- **Dev Site:** http://localhost:4322
- **Sanity Studio:** https://d2-sanitizers.sanity.studio
- **Admin Review:** http://localhost:4322/admin

---

## ⚡️ Quick Commands

```bash
# Start development
npm run dev

# Start Sanity Studio locally
npm run sanity

# Deploy Sanity Studio
npm run sanity:deploy

# Build for production
npm run build
```

---

## 📝 Add Content in 3 Steps

### 1. Add a Product
1. Visit https://d2-sanitizers.sanity.studio
2. Click "Product" → "Create"
3. Fill in details:
   - **Title:** Product name
   - **Cloudinary Image:** `d2-sanitizers/products/[image-name]`
   - **Price:** $XX.XX
   - **Category:** Select from dropdown
4. Publish!

### 2. Create a Blog Post
1. Click "Blog Post" → "Create"
2. Add title and excerpt
3. Write content in rich text editor
4. Add featured image (Cloudinary ID)
5. Link related products
6. Publish!

### 3. Add FAQs
1. Click "FAQ" → "Create"
2. Add question and answer
3. Select category
4. Set display order
5. Publish!

---

## 🖼 Using Images

### Find Cloudinary IDs:
Check `d2-image-mapping.json` for all image IDs.

### Example IDs:
```
Products:
- d2-sanitizers/products/6721089132f74036c0c7c9d5_alpet_d2_surface_sanitizer_case
- d2-sanitizers/products/67116f414b682cb889377088_alpet-e3-spray-group-w-logo-1024

Blog:
- d2-sanitizers/blog/6711349793ce937952f2f20a_mike_usry

Categories:
- d2-sanitizers/categories/67139ef2c33a68ca4b067edb_hand_sanitizer_1
```

---

## 🔑 Credentials

### Sanity:
- **Project ID:** 91lu7dju
- **Dataset:** production
- **Studio:** https://d2-sanitizers.sanity.studio

### Cloudinary:
- **Cloud Name:** southland-organics
- **Images:** 144 uploaded & organized

---

## 📱 Review Pages

Visit **http://localhost:4322/admin** to:
- ✅ Check off reviewed pages
- ✅ Leave notes for feedback
- ✅ Track progress
- ✅ Export notes

---

## 🎯 Key Pages to Review

1. **Homepage** - /
2. **Categories** - /hand-sanitizers, /surface-sanitizers, etc.
3. **Product Example** - /product/alpet-d2-surface-sanitizer
4. **About** - /about
5. **Contact** - /contact
6. **Resources** - /resources

---

## 📚 Full Documentation

- [PROJECT-COMPLETE.md](PROJECT-COMPLETE.md) - Complete overview
- [SANITY-SETUP.md](SANITY-SETUP.md) - Sanity CMS guide
- [d2-image-mapping.json](d2-image-mapping.json) - All image IDs

---

## 💡 Pro Tips

1. **Use Cloudinary IDs directly** - Don't upload to Sanity, use Cloudinary IDs
2. **Check the mapping file** - All images are documented
3. **Test on mobile** - Site is fully responsive
4. **Use the admin checklist** - Track your review progress

---

## 🆘 Need Help?

- Sanity Docs: https://www.sanity.io/docs
- Cloudinary Docs: https://cloudinary.com/documentation
- Astro Docs: https://docs.astro.build

---

**Ready to launch!** 🚀