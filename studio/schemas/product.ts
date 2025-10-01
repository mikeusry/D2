import {defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
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
        {name: 'slug', type: 'slug'},
        {name: 'status', type: 'string'},
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
  ],
})
