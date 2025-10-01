import {defineType} from 'sanity'

export default defineType({
  name: 'productVariant',
  title: 'Product Variant',
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
        {name: 'status', type: 'string'},
        {name: 'sku', type: 'string'},
        {name: 'price', type: 'number'},
        {name: 'productGid', type: 'string'},
      ],
    },
  ],
})
