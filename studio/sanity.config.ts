import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {shopifyAssets} from 'sanity-plugin-shopify-assets'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'D2 Sanitizers',

  projectId: '91lu7dju',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    shopifyAssets({
      shopifyDomain: 'd2sanitizers.myshopify.com',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
