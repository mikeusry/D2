import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '91lu7dju',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function extractImages() {
  const posts = await client.fetch('*[_type == "post"]{ _id, title, body }');

  const allImages = [];

  posts.forEach(post => {
    const imgMatches = post.body?.match(/<img[^>]+src="([^"]+)"[^>]*>/g) || [];
    if (imgMatches.length > 0) {
      console.log(`\n📝 ${post.title}`);
      console.log(`   Post ID: ${post._id}`);
      imgMatches.forEach(img => {
        const srcMatch = img.match(/src="([^"]+)"/);
        const altMatch = img.match(/alt="([^"]*)"/);
        if (srcMatch) {
          const imageUrl = srcMatch[1];
          console.log(`   - ${imageUrl}`);
          allImages.push({
            postId: post._id,
            postTitle: post.title,
            url: imageUrl,
            alt: altMatch ? altMatch[1] : ''
          });
        }
      });
    }
  });

  console.log('\n\n=== SUMMARY ===');
  console.log(`Total images found: ${allImages.length}`);
  console.log('\nAll image URLs:');
  allImages.forEach((img, i) => {
    console.log(`${i + 1}. ${img.url}`);
  });
}

extractImages().catch(console.error);
