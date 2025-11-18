#!/bin/bash

# GAIA 3.1 - Deployment Helper Script
# This script helps prepare your code for deployment to Render + Vercel

echo "🚀 GAIA 3.1 Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "Run: git init"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes"
    echo ""
    git status -s
    echo ""
    read -p "Commit changes now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""

# Check for required files
echo "Checking required files..."

if [ -f "render.yaml" ]; then
    echo "✅ render.yaml found"
else
    echo "❌ render.yaml not found"
    echo "   This file is needed for Render deployment"
fi

if [ -f "backend/package.json" ]; then
    echo "✅ backend/package.json found"
else
    echo "❌ backend/package.json not found"
fi

if [ -f "frontend/package.json" ]; then
    echo "✅ frontend/package.json found"
else
    echo "❌ frontend/package.json not found"
fi

if [ -f "backend/.env.example" ]; then
    echo "✅ backend/.env.example found"
else
    echo "⚠️  backend/.env.example not found (optional)"
fi

echo ""
echo "📦 Checking dependencies..."

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies not installed"
    read -p "Install now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend && npm install && cd ..
        echo "✅ Backend dependencies installed"
    fi
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed"
    read -p "Install now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd frontend && npm install && cd ..
        echo "✅ Frontend dependencies installed"
    fi
fi

echo ""
echo "🔑 Environment Variables Check:"
echo ""

# Check for .env files
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env found"
    echo "   Remember to set these in Render dashboard:"
    echo "   - GEMINI_API_KEY"
    echo "   - OPENROUTER_API_KEY"
    echo "   - DATABASE_URL (auto-set by Render)"
    echo "   - All other API keys"
else
    echo "⚠️  backend/.env not found"
    echo "   You'll need to set environment variables in Render dashboard"
fi

if [ -f "frontend/.env.production" ]; then
    echo "✅ frontend/.env.production found"
else
    echo "⚠️  frontend/.env.production not found"
    echo "   Create it with: VITE_API_URL=https://your-backend.onrender.com"
fi

echo ""
echo "🌐 Git Remote Check:"
echo ""

# Check git remote
if git remote -v | grep -q "origin"; then
    echo "✅ Git remote configured:"
    git remote -v | head -2
else
    echo "❌ No git remote configured"
    echo "   Add remote: git remote add origin <your-repo-url>"
fi

echo ""
echo "📤 Ready to Deploy?"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Go to render.com and create new Blueprint"
echo "3. Connect your GitHub repository"
echo "4. Add environment variables in Render dashboard"
echo "5. Deploy!"
echo ""
echo "For detailed instructions, see:"
echo "- RENDER_DEPLOYMENT_GUIDE.md"
echo "- RENDER_CHECKLIST.md"
echo ""

read -p "Push to GitHub now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo "✅ Pushed to GitHub"
    echo ""
    echo "🎉 Now go to render.com to complete deployment!"
else
    echo "👍 Remember to push when ready: git push origin main"
fi

echo ""
echo "================================"
echo "Deployment helper complete! 🚀"
