# Shopify-Sanity Integration Status

## What We've Done
1. ✅ Installed Sanity Studio in `/Users/mikeusry/CODING/D2/studio/`
2. ✅ Installed `sanity-plugin-shopify-assets` package
3. ✅ Deployed Sanity Studio to: **https://d2.sanity.studio/**
4. ✅ Created schemas with `store` object fields for Shopify Connect:
   - `product.ts` - Product schema
   - `productVariant.ts` - Variant schema
   - `collection.ts` - Collection schema
   - `blogPost.ts` - Blog post schema (NEW)

## Current State
- Sanity Project ID: `91lu7dju`
- Dataset: `production`
- Studio URL (remote): https://d2.sanity.studio/
- Studio URL (local): http://localhost:3333/
- Shopify Store: d2sanitizers.myshopify.com

## Issue
- Shopify Connect app installed but getting 500 errors when trying to sync
- This is likely because the Shopify store may not have products to sync

## Next Step: Import Blog Posts from JSON
- Found 7 blog posts in `d2-apify-crawl.json`
- Created import script at `/Users/mikeusry/CODING/D2/scripts/import-blogs.js`
- **NEED**: Sanity API token with Editor permissions
- Get token from: https://sanity.io/manage/project/91lu7dju/api
- Run: `SANITY_TOKEN=your_token node scripts/import-blogs.js`

## Files Modified
- `/Users/mikeusry/CODING/D2/studio/sanity.config.ts` - Added Shopify plugin
- `/Users/mikeusry/CODING/D2/studio/sanity.cli.ts` - Added deployment config
- `/Users/mikeusry/CODING/D2/studio/schemas/` - All schema files
