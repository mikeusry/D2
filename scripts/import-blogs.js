import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const client = createClient({
  projectId: '91lu7dju',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
})

const crawlData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../archive/data/d2-apify-crawl.json'), 'utf-8')
)

const blogPosts = crawlData.filter((item) => item.url.includes('/blog/'))

async function importBlogs() {
  console.log(`Found ${blogPosts.length} blog posts to import`)

  for (const post of blogPosts) {
    const slug = post.url.split('/blog/')[1].replace(/\/$/, '')

    const doc = {
      _type: 'post',
      title: post.metadata.title,
      slug: {
        _type: 'slug',
        current: slug,
      },
      body: post.markdown,
      publishedAt: new Date(post.crawl.loadedTime).toISOString(),
    }

    try {
      const result = await client.create(doc)
      console.log(`✓ Imported: ${post.metadata.title}`)
    } catch (error) {
      console.error(`✗ Failed to import: ${post.metadata.title}`, error.message)
    }
  }

  console.log('Import complete!')
}

importBlogs()
