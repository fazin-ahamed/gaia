#!/bin/bash

# GAIA Database Migration Script for Render
# This script can be run manually or as part of the build process

echo "======================================"
echo "GAIA Database Migration"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in Render environment variables"
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
fi

# Run migration
echo "🔄 Running database migration..."
node migrate-and-seed.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ Migration completed successfully!"
    echo "======================================"
    exit 0
else
    echo ""
    echo "======================================"
    echo "❌ Migration failed!"
    echo "======================================"
    exit 1
fi
