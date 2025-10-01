import { createClient } from '@sanity/client';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Sanity
const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '91lu7dju',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN, // You'll need this to write
});

async function uploadToCloudinary(imageUrl, imageName) {
  try {
    console.log(`Uploading ${imageName} to Cloudinary...`);

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'd2-sanitizers/blog',
      public_id: imageName,
      resource_type: 'image'
    });

    console.log(`✅ Uploaded: ${result.public_id}`);
    return result.public_id;
  } catch (error) {
    console.error(`❌ Failed to upload ${imageName}:`, error.message);
    return null;
  }
}

async function migrateImages() {
  const posts = await client.fetch('*[_type == "post"]{ _id, title, body }');

  console.log(`Found ${posts.length} blog posts\n`);

  for (const post of posts) {
    console.log(`\n📝 Processing: ${post.title}`);

    if (!post.body) {
      console.log('   No body content, skipping...');
      continue;
    }

    // Find all image markdown patterns: ![alt](url) or ![](url)
    const imageRegex = /!\[([^\]]*)\]\((https:\/\/cdn\.prod\.website-files\.com\/[^)]+)\)/g;
    const matches = [...post.body.matchAll(imageRegex)];

    if (matches.length === 0) {
      console.log('   No Webflow images found');
      continue;
    }

    console.log(`   Found ${matches.length} images`);

    let updatedBody = post.body;

    for (const match of matches) {
      const [fullMatch, alt, imageUrl] = match;

      // Extract a clean filename from the URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1]
        .replace(/\.[^.]+$/, '') // Remove extension
        .replace(/_result$/, '') // Remove _result suffix
        .replace(/[^a-zA-Z0-9-]/g, '-') // Replace special chars with dash
        .substring(0, 60); // Limit length

      console.log(`   - ${filename}`);

      // Upload to Cloudinary
      const cloudinaryId = await uploadToCloudinary(imageUrl, filename);

      if (cloudinaryId) {
        // Replace with Cloudinary URL
        const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cloudinaryId}`;
        updatedBody = updatedBody.replace(fullMatch, `![${alt}](${cloudinaryUrl})`);
        console.log(`     ✅ Replaced with: ${cloudinaryUrl}`);
      }
    }

    // Update the post in Sanity if changes were made
    if (updatedBody !== post.body) {
      try {
        await client
          .patch(post._id)
          .set({ body: updatedBody })
          .commit();
        console.log(`   ✅ Updated post in Sanity`);
      } catch (error) {
        console.error(`   ❌ Failed to update post:`, error.message);
      }
    }
  }

  console.log('\n\n✅ Migration complete!');
}

migrateImages().catch(console.error);
