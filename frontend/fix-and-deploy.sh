#!/bin/bash

echo "🔧 Fixing CSS for Vercel Deployment"
echo "===================================="
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build project
echo "🏗️  Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Preview build
echo "👀 Starting preview server..."
echo "   Visit http://localhost:4173 to test"
echo "   Press Ctrl+C when done testing"
echo ""

npm run preview &
PREVIEW_PID=$!

# Wait for user
read -p "Press Enter when you've verified the CSS works in preview..."

# Kill preview server
kill $PREVIEW_PID 2>/dev/null

echo ""
echo "🚀 Ready to deploy to Vercel!"
echo ""

read -p "Deploy now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v vercel &> /dev/null; then
        echo "Deploying to Vercel..."
        vercel --prod
        echo ""
        echo "✅ Deployed successfully!"
    else
        echo "⚠️  Vercel CLI not installed"
        echo "   Install: npm install -g vercel"
        echo "   Or deploy via GitHub push"
    fi
else
    echo "👍 Deploy manually when ready:"
    echo "   vercel --prod"
fi

echo ""
echo "===================================="
echo "✨ Done!"
