import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Set to false if you need fresh data
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Type definitions
export interface FAQ {
  _id: string;
  _type: 'faq';
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

// Helper to get all products
export async function getAllProducts() {
  return await sanityClient.fetch(`
    *[_type == "product"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      cloudinaryImage,
      price,
      description,
      featured,
      category->{
        name,
        slug
      }
    }
  `);
}

// Helper to get single product by slug
export async function getProductBySlug(slug: string) {
  return await sanityClient.fetch(`
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      cloudinaryImage,
      price,
      description,
      longDescription,
      features,
      bestSuitedFor,
      documents,
      category->{
        name,
        slug
      }
    }
  `, { slug });
}

// Helper to get products by category
export async function getProductsByCategory(categorySlug: string) {
  return await sanityClient.fetch(`
    *[_type == "product" && category->slug.current == $categorySlug] | order(publishedAt desc) {
      _id,
      title,
      slug,
      cloudinaryImage,
      price,
      description
    }
  `, { categorySlug });
}

// Helper to get all blog posts
export async function getAllBlogPosts() {
  return await sanityClient.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      featuredImage,
      excerpt,
      author,
      publishedAt,
      categories[]->{
        name,
        slug
      }
    }
  `);
}

// Helper to get single blog post by slug
export async function getBlogPostBySlug(slug: string) {
  return await sanityClient.fetch(`
    *[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      featuredImage,
      excerpt,
      body,
      author,
      publishedAt,
      categories[]->{
        name,
        slug
      },
      relatedProducts[]->{
        title,
        slug,
        cloudinaryImage,
        price
      }
    }
  `, { slug });
}

// Fetch all FAQs
export async function getFAQs(): Promise<FAQ[]> {
  const query = `*[_type == "faq"] | order(order asc, _createdAt desc) {
    _id,
    _type,
    question,
    answer,
    category,
    order
  }`;

  return sanityClient.fetch(query);
}

// Fetch FAQs by category
export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  const query = `*[_type == "faq" && category == $category] | order(order asc, _createdAt desc) {
    _id,
    _type,
    question,
    answer,
    category,
    order
  }`;

  return sanityClient.fetch(query, { category });
}

// Helper to get all industries
export async function getAllIndustries() {
  return await sanityClient.fetch(`
    *[_type == "industry"] {
      _id,
      name,
      slug,
      icon,
      description
    }
  `);
}

// Helper to get single industry by slug
export async function getIndustryBySlug(slug: string) {
  return await sanityClient.fetch(`
    *[_type == "industry" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      icon,
      description,
      fullDescription,
      challenges,
      solutions,
      relatedProducts[]->{
        title,
        slug,
        cloudinaryImage,
        price,
        description
      }
    }
  `, { slug });
}

// Helper to get all categories
export async function getAllCategories() {
  return await sanityClient.fetch(`
    *[_type == "category"] {
      _id,
      name,
      slug,
      description,
      heroImage
    }
  `);
}