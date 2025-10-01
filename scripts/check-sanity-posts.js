import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '91lu7dju',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkPosts() {
  try {
    console.log('Fetching blog posts from Sanity...\n');
    const posts = await client.fetch('*[_type == "post"]');

    console.log(`Found ${posts.length} blog posts:\n`);

    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title || post.store?.title || 'Untitled'}`);
      console.log(`   Slug: ${post.slug?.current || 'No slug'}`);
      console.log(`   Published: ${post.publishedAt || post.store?.publishedAt || 'Not set'}`);
      console.log('');
    });

    console.log('\nFull data:');
    console.log(JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }
}

checkPosts();
