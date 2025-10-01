import {defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'store',
      title: 'Shopify',
      type: 'object',
      readOnly: true,
      fields: [
        {name: 'id', type: 'number'},
        {name: 'gid', type: 'string'},
        {name: 'title', type: 'string'},
        {name: 'handle', type: 'string'},
        {name: 'bodyHtml', type: 'text'},
        {name: 'publishedAt', type: 'datetime'},
      ],
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'store.title',
      },
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
})
