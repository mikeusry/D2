import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '91lu7dju',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
})

async function removeDuplicates() {
  // Fetch all blog posts
  const posts = await client.fetch(`*[_type == "post"] | order(_createdAt asc) {_id, title, "slug": slug.current}`)

  console.log(`Found ${posts.length} total blog posts`)

  // Group by slug to find duplicates
  const seenSlugs = new Map()
  const toDelete = []

  for (const post of posts) {
    if (seenSlugs.has(post.slug)) {
      // This is a duplicate, mark for deletion
      toDelete.push(post._id)
      console.log(`✗ Duplicate found: ${post.title} (${post._id})`)
    } else {
      // First occurrence, keep it
      seenSlugs.set(post.slug, post._id)
      console.log(`✓ Keeping: ${post.title}`)
    }
  }

  if (toDelete.length === 0) {
    console.log('\nNo duplicates found!')
    return
  }

  console.log(`\nDeleting ${toDelete.length} duplicate posts...`)

  for (const id of toDelete) {
    await client.delete(id)
    console.log(`✓ Deleted: ${id}`)
  }

  console.log('\nCleanup complete!')
}

removeDuplicates()
