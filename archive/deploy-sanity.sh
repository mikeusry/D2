#!/bin/bash

# D2 Sanitizers - Sanity Studio Deployment Script

echo "🚀 Deploying D2 Sanitizers Sanity Studio..."
echo ""
echo "When prompted, enter: d2-sanitizers"
echo ""

cd studio
npx sanity deploy

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your studio: https://d2-sanitizers.sanity.studio"